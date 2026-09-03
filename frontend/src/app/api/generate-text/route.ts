import { NextResponse } from 'next/server';
import { generateWithGemini25Flash } from '@/lib/gemini';

const USER_POST_TEXT_EXPANSION_PROMPT = `Generate a clear, urgent, and structured report based on the following details to help authorities understand the victim's situation and take prompt action. The report should be in the first person, highlighting the severity of the situation, the frequency of the abuse, and the danger posed by the perpetrator. The narrative should be concise and emphasize the need for immediate intervention. The report should also include the preferred method of contact to ensure a fast response. Report shouldn't be in markdown format.`;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const formattedInput = `
Name: ${data.name || 'Not specified'}
Phone: ${data.phone || 'Not specified'}
Location: ${data.location ? `${data.location.lat}, ${data.location.lng}` : 'Not specified'}
How long has it been occurring?: ${data.occurrenceDuration || 'Not specified'}
Frequency of Incidents: ${data.frequency || 'Not specified'}
Preferred Contact Method: ${Array.isArray(data.preferredContact) ? data.preferredContact.join(', ') : data.preferredContact || 'Not specified'}
Current Situation: ${data.currentSituation || 'Not specified'}
Culprit Description: ${data.culprit || 'Not specified'}
`;

    const gemini_response = await generateWithGemini25Flash(
      `${USER_POST_TEXT_EXPANSION_PROMPT}\n\nInputs:\n${formattedInput}`,
      'You are an AI assistant helping craft urgent, clear distress reports for women seeking help.'
    );

    const gemma_response = await generateWithGemini25Flash(
      `Provide an alternate concise version of this distress report:\n${gemini_response}`,
      'You are an AI assistant providing concise, urgent reports.'
    );

    return NextResponse.json(
      {
        gemini_response,
        gemma_response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating text with Gemini 2.5 Flash:', error);
    return NextResponse.json(
      { error: 'Failed to generate distress report' },
      { status: 500 }
    );
  }
}
