import { NextResponse } from 'next/server';
import { generateWithGemini25Flash } from '@/lib/gemini';

const USER_POST_TEXT_EXPANSION_PROMPT = `Generate a clear, urgent, and structured report based on the following details to help authorities understand the victim's situation and take prompt action. The report should be in the first person, highlighting the severity of the situation, the frequency of the abuse, and the danger posed by the perpetrator. The narrative should be concise and emphasize the need for immediate intervention. The report should also include the preferred method of contact to ensure a fast response. Report shouldn't be in markdown format.`;

export async function POST(req: Request) {
  let data: any = {};
  try {
    data = await req.json();
  } catch {
    data = {};
  }

  const name = data.name || 'Confidential Victim';
  const phone = data.phone || 'Confidential Contact';
  const loc = data.location
    ? typeof data.location === 'object'
      ? `${data.location.lat}, ${data.location.lng}`
      : data.location
    : '28.6139, 77.2090';
  const contact = Array.isArray(data.preferredContact)
    ? data.preferredContact.join(', ')
    : data.preferredContact || 'Phone';
  const situation =
    data.currentSituation ||
    'Ongoing domestic abuse, severe psychological coercion, and imminent danger to safety';
  const culprit = data.culprit || 'Perpetrator exhibits escalating aggressive behavior';
  const frequency = data.frequency ? `${data.frequency} incidents recorded` : 'Repeated / Continuous';
  const duration = data.occurrenceDuration
    ? `${data.occurrenceDuration} months`
    : 'Ongoing duration';

  const defaultReport = `URGENT DISTRESS REPORT: I am submitting this urgent statement to report severe domestic abuse and request immediate protective intervention.
Victim: ${name}.
Current Emergency Situation: ${situation}.
Perpetrator Information: ${culprit}.
Frequency & Timeline: Occurring over ${duration}, with approximately ${frequency}.
Preferred Contact Method: ${contact} (${phone}).
Coordinates: ${loc}.
I urgently request law enforcement and protective authorities to initiate swift contact and emergency assistance.`;

  const defaultConcise = `URGENT DISTRESS ALERT: Domestic abuse incident reported by ${name}. Situation: ${situation}. Culprit details: ${culprit}. Immediate protective intervention needed at ${loc}. Reach victim via ${contact} (${phone}).`;

  try {
    const formattedInput = `
Name: ${name}
Phone: ${phone}
Location: ${loc}
How long has it been occurring?: ${duration}
Frequency of Incidents: ${frequency}
Preferred Contact Method: ${contact}
Current Situation: ${situation}
Culprit Description: ${culprit}
`;

    const gemini_response = await generateWithGemini25Flash(
      `${USER_POST_TEXT_EXPANSION_PROMPT}\n\nInputs:\n${formattedInput}`,
      'You are an AI assistant helping craft urgent, clear distress reports for women seeking help.'
    );

    let gemma_response = '';
    try {
      gemma_response = await generateWithGemini25Flash(
        `Provide an alternate concise version of this distress report:\n${gemini_response}`,
        'You are an AI assistant providing concise, urgent reports.'
      );
    } catch {
      gemma_response = defaultConcise;
    }

    return NextResponse.json(
      {
        gemini_response: gemini_response || defaultReport,
        gemma_response: gemma_response || defaultConcise,
      },
      { status: 200 }
    );
  } catch (error) {
    console.warn('AI generator fallback active for distress report:', error);
    return NextResponse.json(
      {
        gemini_response: defaultReport,
        gemma_response: defaultConcise,
      },
      { status: 200 }
    );
  }
}

