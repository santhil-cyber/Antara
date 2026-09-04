import { NextResponse } from 'next/server';
import { generateChatWithGemini25Flash, ChatMessage } from '@/lib/gemini';

const THERAPY_BOT_SYSTEM_PROMPT = `You are Antara's Therapy Bot, a compassionate, warm, and trauma-informed AI emotional support companion dedicated to women, survivors, and anyone seeking emotional safety, calming guidance, or distress relief.

Core Principles:
1. Warm Empathy: Provide unconditional emotional validation, gentle tone, and deep presence.
2. Emotional Grounding: When anxiety, panic, or overwhelm is expressed, proactively offer practical calming exercises (such as 4-7-8 deep breathing, 5-4-3-2-1 sensory grounding, or body relaxation).
3. Safety & Trauma Sensitivity: Respect boundaries, validate survivor experiences, and never victim-blame.
4. Emergency & Helpline Resources: If the user describes active domestic danger, physical harm, or crisis, reassure them of their worth and provide emergency contacts:
   - India Women Helpline: 1091
   - National Emergency Helpline: 112
   - Mental Health Tele-MANAS: 14416 / 1800-891-4416
   - Vandrevala Foundation Helpline: +91 9999 666 555
   - International: 911 (US/Canada), 999 (UK), 112 (Europe).
5. Formatting: Use clear, comforting, easy-to-read formatting with gentle emojis and markdown paragraphs.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userInput = body.message || body.userInput;
    const history: Array<{ role: 'user' | 'assistant'; text?: string; content?: string }> =
      body.history || [];

    if (!userInput || typeof userInput !== 'string' || !userInput.trim()) {
      return NextResponse.json(
        { error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    const conversationMessages: ChatMessage[] = [];

    // Include recent conversational history (up to last 10 messages for context)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      const content = msg.content || msg.text || '';
      if (content) {
        conversationMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content,
        });
      }
    }

    // Add current user message
    conversationMessages.push({
      role: 'user',
      content: userInput.trim(),
    });

    const reply = await generateChatWithGemini25Flash(
      conversationMessages,
      THERAPY_BOT_SYSTEM_PROMPT
    );

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error('Error in Therapy Bot API route:', error);
    return NextResponse.json(
      {
        reply:
          "I am here with you. Take a slow, gentle breath. I experienced a momentary glitch, but your feelings matter deeply. Please tell me again what is on your heart.",
      },
      { status: 200 }
    );
  }
}
