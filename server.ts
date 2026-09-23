import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Helper to lazily initialize GoogleGenAI with proper telemetry
  function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Chat endpoint for multi-turn conversations
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    try {
      const {
        messages,
        model = 'gemini-3.5-flash',
        systemInstruction = 'You are CineMotion AI, an expert motion graphics director, animation designer, and video editor. You help creators craft stunning videos, suggest transitions, keyframe animation ideas, color palettes, and pacing.',
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const ai = getGeminiClient();

      // Format messages into Gemini format
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }],
      }));

      // Map valid models as requested:
      // gemini-3.1-pro-preview for complex tasks
      // gemini-3.5-flash for general tasks
      // gemini-3.1-flash-lite for fast tasks
      let targetModel = model;
      if (!['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].includes(targetModel)) {
        targetModel = 'gemini-3.5-flash';
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'I have analyzed your request.';
      return res.json({ reply, modelUsed: targetModel });
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate chat response',
      });
    }
  });

  // High-Quality Image Generation endpoint using gemini-3-pro-image-preview
  app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        aspectRatio = '16:9',
        imageSize = '1K', // 1K, 2K, 4K
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'A prompt string is required' });
      }

      const ai = getGeminiClient();

      // Requested model: gemini-3-pro-image-preview
      const model = 'gemini-3-pro-image-preview';

      let response;
      try {
        response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: imageSize as any,
            },
          },
        });
      } catch (primaryErr: any) {
        console.warn(`Primary image generation model ${model} failed, attempting fallback to gemini-3.1-flash-image:`, primaryErr?.message);
        // Fallback to flash-image if quota or model permission requires
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: imageSize as any,
            },
          },
        });
      }

      let imageUrl: string | null = null;
      let textOutput = '';

      if (response?.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            textOutput += part.text;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: 'No image was returned by the model.',
          details: textOutput,
        });
      }

      return res.json({
        imageUrl,
        aspectRatio,
        imageSize,
        prompt,
      });
    } catch (error: any) {
      console.error('Gemini image generation error:', error);
      return res.status(500).json({
        error: error.message || 'Image generation failed',
      });
    }
  });

  // Setup Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MotionCraft server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
