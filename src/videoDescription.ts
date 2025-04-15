import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { extractFramesAsBase64 } from './frames';

dotenv.config();

// Initialize the OpenAI client with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function describeVideoFrames(videoPath: string, fps: number) {
  try {
    const framesBase64: string[] = await extractFramesAsBase64(videoPath, fps);

    const content = [
      { type: "text", text: "Describe the content of the video based on these frames:" },
      ...framesBase64.map(frameBase64 => ({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${frameBase64}`,
          detail: "auto", 
        }
      }))
    ];

    // Configure the messages array
    const messages = [
      {
        role: "user",
        content
      }
    ];

    const model = "gpt-4-turbo-2024-04-09";

    // Call the API
    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 300,
    });

    console.log("Description:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error describing video frames:", error);
  }
}

const videoPath = path.join(process.cwd(), 'video_data', 'v_Archery_g11_c01.mp4');
const framesPerSecond = 1;

describeVideoFrames(videoPath, framesPerSecond);
