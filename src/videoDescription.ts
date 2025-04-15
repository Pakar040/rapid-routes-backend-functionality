// Do bun run src/videoDescription.ts to intiate the server
// Then go to your web browser and paste in http://127.0.0.1:3000/video-description.html

import { serve } from "bun";
import { extractFramesAsBase64 } from "./frames";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function describeVideoFrames(videoPath: string, fps: number): Promise<string> {
  try {
    const framesBase64: string[] = await extractFramesAsBase64(videoPath, fps);
    console.log("Extracted frames count:", framesBase64.length);
    
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
    
    const messages = [{ role: "user", content }];
    const model = "gpt-4-turbo-2024-04-09";
    
    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 300,
    });
    
    console.log("OpenAI response:", JSON.stringify(response, null, 2));
    return response.choices[0].message.content as string;
  } catch (error: any) {
    console.error("Error describing video frames:", error);
    // Rethrow error to be handled in the server endpoint
    throw error;
  }
}

// Bun server to handle video upload and serve the HTML page.
serve({
  async fetch(request) {
    const { pathname } = new URL(request.url);

    // Serve static HTML page from /public directory.
    if (pathname === "/" || pathname === "/video-description.html") {
      const filePath = path.join(process.cwd(), "public", "video-description.html");
      return new Response(fs.readFileSync(filePath), {
        headers: { "Content-Type": "text/html" }
      });
    }

    // Handle POST request to /analyze-video
    if (pathname === "/analyze-video" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("users_video");
        if (!file || typeof file === "string") {
          return new Response(
            JSON.stringify({ error: "No video uploaded" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Save the uploaded file temporarily.
        const tempPath = path.join(process.cwd(), "uploads", `${Date.now()}-${file.name}`);
        const arrayBuffer = await file.arrayBuffer();
        fs.mkdirSync(path.join(process.cwd(), "uploads"), { recursive: true });
        fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));

        const description = await describeVideoFrames(tempPath, 1);

        // Remove the temporary file.
        fs.unlinkSync(tempPath);

        return new Response(JSON.stringify({ description }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error: any) {
        console.error("Error processing video:", error);
        const errMessage = error.message || "Server error";
        const errStack = error.stack || "";
        return new Response(
          JSON.stringify({ error: errMessage, stack: errStack }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
  port: parseInt(process.env.PORT || "3000")
});
