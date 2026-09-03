import { NextResponse } from 'next/server';
import { generateWithGemini25Flash } from '@/lib/gemini';

const LAW_BOT_SYSTEM_PROMPT = `You are Antara's Law Bot, an empathetic and knowledgeable AI legal assistant specializing in women's rights, domestic abuse protection, custody laws, property rights, and legal guidance.
Provide clear, compassionate, and easy-to-understand guidance based on constitutional and legal rights. Break down complex legal concepts into accessible explanations and advise on safe, practical next steps.`;

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    const reply = await generateWithGemini25Flash(
      userInput,
      LAW_BOT_SYSTEM_PROMPT
    );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in Law Bot chat route:', error);
    return NextResponse.json(
      { error: 'There was an issue processing your request.' },
      { status: 500 }
    );
  }
}
