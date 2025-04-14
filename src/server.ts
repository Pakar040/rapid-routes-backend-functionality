import express, { type Request, type Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { SpeechGenerator } from './textToSpeech';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ==============================
//            Pages
// ==============================
// index.html
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// text-to-speech.html
app.get('/text-to-speech.html', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'text-to-speech.html'));
});

// ==============================
//            Methods
// ==============================
// text-to-speech generate mp3
// @ts-ignore: Bun and TypeScript don't like Express overloads
app.post('/api/text-to-speech', async (req: Request, res: Response) => {
  const body = req.body as { input: string; instructions: string };

  if (!body.input || !body.instructions) {
    return res.status(400).json({ error: 'Missing input or instructions' });
  }

  const generator = new SpeechGenerator(process.env.OPENAI_API_KEY as string);

  try {
    const buffer = await generator.generateSpeechBuffer(body.input, body.instructions);
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    console.error('Speech generation error:', err);
    res.status(500).json({ error: 'Speech generation failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

