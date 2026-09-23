import { ChatMessage, GeminiChatModel } from '../types';

export async function sendChatMessage(
  messages: ChatMessage[],
  model: GeminiChatModel = 'gemini-3.5-flash',
  systemInstruction?: string
): Promise<{ reply: string; modelUsed: string }> {
  const payload = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    model,
    systemInstruction,
  };

  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `AI Chat error: ${res.statusText}`);
  }

  return res.json();
}

export async function generateHighQualityImage(
  prompt: string,
  aspectRatio: string = '16:9',
  imageSize: '1K' | '2K' | '4K' = '1K'
): Promise<{ imageUrl: string; prompt: string; aspectRatio: string; imageSize: string }> {
  const res = await fetch('/api/gemini/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspectRatio,
      imageSize,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Image generation error: ${res.statusText}`);
  }

  return res.json();
}
