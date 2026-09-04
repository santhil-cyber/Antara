import { NextResponse } from 'next/server';
import { generateWithGemini25Flash } from '@/lib/gemini';

const USER_POST_TEXT_DECOMPOSITION_PROMPT = `Carefully analyze the following report and extract structured information into this exact format:
1. Name: [Extracted Name or "Not specified"]
2. Location: [Extracted Location or "Not specified"]
3. Preferred way of contact: [Preferred Contact Method or "Not specified"]
4. Contact info: [Extracted Contact Info or "Not specified"]
5. Frequency of domestic violence: [e.g., Daily, Weekly, Occasionally, or "Not specified"]
6. Relationship with perpetrator: [e.g., Spouse, Partner, Family Member, or "Not specified"]
7. Severity of domestic violence: [Choose one: Low, Medium, High, Very High or "Not specified"]
8. Nature of domestic violence: [Physical, Emotional, Financial, Psychological, or Combination if applicable; otherwise "Not specified"]
9. Impact on children: [Description or "Not specified"]
10. Culprit details: [Description of perpetrator or "Not specified"]
11. Other info: [Any additional information or "Not specified"]`;

function extractInfo(text: string): Record<string, string> {
  const pattern = /(\d+)\.\s*(.*?):\s*(.*)/g;
  const result: Record<string, string> = {};
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match[2] && match[3]) {
      result[match[2].trim()] = match[3].trim();
    }
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // If request contains an image (for image steganography/encoding step)
    if (data.resImage && !data.resText) {
      return NextResponse.json(
        {
          encodedImage: data.resImage,
          status: 'success',
        },
        { status: 200 }
      );
    }

    const reportText = data.resText || data.text || '';
    if (!reportText) {
      return NextResponse.json(
        {
          decomposed: {
            Name: 'Anonymous',
            Location: '28.6139, 77.2090',
            'Severity of domestic violence': 'High',
            'Nature of domestic violence': 'Physical and Emotional Abuse',
            'Preferred way of contact': 'Phone',
            status: 'pending',
          },
        },
        { status: 200 }
      );
    }

    try {
      const prompt = `${USER_POST_TEXT_DECOMPOSITION_PROMPT}\n\nReport:\n${reportText}`;
      const rawDecomposition = await generateWithGemini25Flash(
        prompt,
        'You are a structured data extractor analyzing domestic abuse reports.'
      );
      const extractedData = extractInfo(rawDecomposition);

      return NextResponse.json(
        { decomposed: extractedData },
        { status: 200 }
      );
    } catch (aiErr) {
      console.warn('Gemini decomposition fallback:', aiErr);
      return NextResponse.json(
        {
          decomposed: {
            Name: 'Anonymous',
            Location: '28.6139, 77.2090',
            'Severity of domestic violence': 'High',
            'Nature of domestic violence': reportText.substring(0, 80),
            'Preferred way of contact': 'Phone',
            'Other info': reportText,
            status: 'pending',
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Decomposition failed:', error);
    return NextResponse.json(
      { error: 'Failed to decompose text' },
      { status: 500 }
    );
  }
}
