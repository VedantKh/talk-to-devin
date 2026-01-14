import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { transcribeAudio, synthesizeSpeech } from './services/voice.js';
import { chatWithClaude } from './services/claude.js';
import { connectToDeepWiki } from './services/mcp-client.js';

dotenv.config({ path: '../.env' });

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Store active sessions
const sessions = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add a repository
app.post('/api/repo', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    // For now, just store the repo URL
    // Later: trigger DeepWiki indexing via Devin API
    const sessionId = Date.now().toString();
    sessions.set(sessionId, {
      repoUrl,
      messages: [],
      tasks: []
    });

    res.json({
      sessionId,
      message: 'Repository added successfully',
      repoUrl
    });
  } catch (error) {
    console.error('Error adding repository:', error);
    res.status(500).json({ error: 'Failed to add repository' });
  }
});

// Voice endpoint - transcribe audio and get AI response
app.post('/api/voice', upload.single('audio'), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const audioBuffer = req.file?.buffer;

    if (!audioBuffer) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = sessions.get(sessionId);

    // Step 1: Transcribe audio
    const transcript = await transcribeAudio(audioBuffer);

    // Step 2: Add user message to session
    session.messages.push({
      role: 'user',
      content: transcript
    });

    // Step 3: Get AI response (with MCP context from DeepWiki)
    const aiResponse = await chatWithClaude(
      session.messages,
      session.repoUrl
    );

    // Step 4: Add AI response to session
    session.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    // Step 5: Synthesize speech (optional for now)
    // const audioResponse = await synthesizeSpeech(aiResponse);

    res.json({
      transcript,
      response: aiResponse,
      // audio: audioResponse
    });
  } catch (error) {
    console.error('Error processing voice:', error);
    res.status(500).json({ error: 'Failed to process voice input' });
  }
});

// Get session messages
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(sessions.get(sessionId));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
