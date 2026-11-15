import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ttsCache = new Map<string, Buffer>();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function synthesizeShipLogAudio(text: string, lang: 'es' | 'en'): Promise<Buffer> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const stylePrompt =
    lang === 'es'
      ? 'Voz masculina cálida, tranquila, cercana y completamente humana, como la de una persona dejando una grabación personal de bitácora o una IA amigable estilo H.U.E. de Final Space; ritmo pausado y natural, nunca robótica ni metálica.'
      : 'Warm, calm, conversational, completely human male voice, like a thoughtful person leaving a personal voice log on tape or a friendly ship companion like H.U.E. from Final Space; steady natural pacing, never robotic or synthetic.';

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text,
            speechMetadata: {
              style: stylePrompt,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Charon' },
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error('No audio data returned by Gemini TTS');
  }

  return Buffer.from(base64Audio, 'base64');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/tts', async (req, res) => {
    try {
      const { cacheKey, text, lang } = req.body as {
        cacheKey?: string;
        text?: string;
        lang?: 'es' | 'en';
      };

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const normalizedLang: 'es' | 'en' = lang === 'en' ? 'en' : 'es';
      const trimmedText = text.trim().slice(0, 4000);
      const effectiveKey =
        typeof cacheKey === 'string' && cacheKey.trim()
          ? `${cacheKey.trim()}:${normalizedLang}`
          : `${normalizedLang}:${trimmedText}`;

      const cached = ttsCache.get(effectiveKey);
      if (cached) {
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(cached);
      }

      let wavBuffer: Buffer;
      try {
        wavBuffer = await synthesizeShipLogAudio(trimmedText, normalizedLang);
      } catch (firstErr) {
        // One quick retry for transient API failures
        await new Promise((r) => setTimeout(r, 350));
        wavBuffer = await synthesizeShipLogAudio(trimmedText, normalizedLang);
      }

      if (ttsCache.size > 60) {
        const oldestKey = ttsCache.keys().next().value;
        if (oldestKey) ttsCache.delete(oldestKey);
      }
      ttsCache.set(effectiveKey, wavBuffer);

      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(wavBuffer);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate audio';
      console.error('[TTS Error]', message);
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      try {
        const templatePath = path.join(__dirname, 'index.html');
        const template = fs.readFileSync(templatePath, 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
