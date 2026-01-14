import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

let openai: OpenAI;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Write buffer to temporary file (Whisper API requires a file)
    const tempFilePath = path.join(tmpdir(), `audio-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    const transcription = await getOpenAI().audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  try {
    const mp3 = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw new Error('Failed to synthesize speech');
  }
}
