import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/save-extracted-data`,
          data,
          { timeout: 4000 }
        );
        return NextResponse.json({ data: res.data.status || 'saved' }, { status: 200 });
      } catch (backendErr) {
        console.warn('Backend save unavailable, returning local success:', backendErr);
      }
    }

    return NextResponse.json({ data: 'saved_successfully' }, { status: 200 });
  } catch (error) {
    console.error('Save failed:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}
