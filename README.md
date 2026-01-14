# Talk to Devin

A voice-based planning interface for Devin that uses DeepWiki for codebase context.

## Quick Start

1. **Copy `.env.example` to `.env`** and add your API keys:
   ```bash
   cp .env.example .env
   ```

   Required keys:
   - `OPENAI_API_KEY` - For Whisper speech-to-text
   - `ANTHROPIC_API_KEY` - For Claude AI
   - `DEVIN_API_KEY` - Your Devin API key

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

4. **Open http://localhost:5173** in your browser

## How to Use

1. Enter a repository URL (GitHub, GitLab, etc.)
2. Click "Start Planning"
3. Click the microphone button and start talking about what you want to build
4. See your words transcribed live as you speak
5. AI responds with questions and generates tasks for Devin

## Features

- Live speech transcription as you talk
- Conversational AI planning with Claude
- DeepWiki integration for codebase context (coming soon)
- Task generation for Devin

## Architecture

- **Frontend**: Vite + React + TypeScript (port 5173)
- **Backend**: Express + TypeScript (port 3001)
- **Voice**: OpenAI Whisper (STT) + Claude + OpenAI TTS
- **Context**: DeepWiki MCP for codebase knowledge

## Next Steps

To complete the integration:

1. **DeepWiki MCP Integration** - Connect to Cognition's DeepWiki MCP server in `backend/src/services/mcp-client.ts`
2. **Claude MCP Support** - Wire up MCP tools to Claude's API calls
3. **Task Generation** - Add structured task output format
4. **Devin API** - Submit generated tasks to Devin
