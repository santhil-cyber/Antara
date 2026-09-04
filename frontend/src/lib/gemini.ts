const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

export const GEMINI_FLASH_MODEL = 'google/gemini-2.5-flash';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateChatWithGemini25Flash(
  conversationMessages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  messages.push(...conversationMessages);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://antara-cyber.vercel.app',
      'X-Title': 'Antara AI',
    },
    body: JSON.stringify({
      model: GEMINI_FLASH_MODEL,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorData}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function generateWithGemini25Flash(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  return generateChatWithGemini25Flash([{ role: 'user', content: prompt }], systemPrompt);
}
