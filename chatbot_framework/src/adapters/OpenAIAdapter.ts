import type { GenerateOptions, GenerateResult, ModelClient } from '../types';
import fetch from 'node-fetch';

export class OpenAIAdapter implements ModelClient {
  constructor(
    private apiKey: string,
    private baseURL = 'https://api.openai.com/v1'
  ) {}

  async generate(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<GenerateResult> {
    const resp = await fetch(`${this.baseURL}/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model ?? 'gpt-3.5-turbo',
        prompt,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        // any other GenerateOptions
      }),
    });
    const { choices, usage } = await resp.json();
    return {
      text: choices[0].text as string,
      tokensUsed: usage.total_tokens as number,
    };
  }
}
