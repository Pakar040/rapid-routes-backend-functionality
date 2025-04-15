import ffmpeg from 'fluent-ffmpeg';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'fs';
import path from 'path';

// Extract frames and return as base64 strings
export async function extractFramesAsBase64(videoPath: string, fps: number): Promise<string[]> {
  const tempDir = path.join(process.cwd(), 'temp_frames');

  // Ensure temp directory exists
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  // Extract frames to temp directory
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .output(path.join(tempDir, 'frame-%03d.png'))
      .outputOptions(['-vf', `fps=${fps}`])
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  // Read extracted frames into base64 strings
  const frameFiles = readdirSync(tempDir).filter(file => file.endsWith('.png'));

  const base64Frames = frameFiles.map(file => {
    const imagePath = path.join(tempDir, file);
    const imageBuffer = readFileSync(imagePath);
    return imageBuffer.toString('base64');
  });

  // Clean up (remove temp directory and files)
  rmSync(tempDir, { recursive: true, force: true });

  return base64Frames;
}

