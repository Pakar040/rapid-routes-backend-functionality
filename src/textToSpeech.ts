import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export class SpeechGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateSpeech(
    input: string,
    instructions: string,
    speechFilePath: string
  ): Promise<void> {

    const model = "gpt-4o-mini-tts";
    const voice = "coral";

    const mp3 = await this.openai.audio.speech.create({
      model,
      voice,
      input,
      instructions,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const resolvedPath = path.resolve(speechFilePath);
    await fs.promises.writeFile(resolvedPath, buffer);
    console.log(`Speech file written to ${resolvedPath}`);
  }
}
