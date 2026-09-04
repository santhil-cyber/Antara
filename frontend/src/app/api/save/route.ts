import axios from 'axios';
import { NextResponse } from 'next/server';
import { savePost } from '@/lib/posts-store';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Save locally in persistent store
    const saved = savePost(data);

    // 2. Forward to external backend if available
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/save-extracted-data`,
          data,
          { timeout: 3000 }
        );
      } catch (backendErr) {
        console.warn('Backend save unavailable, saved to Antara local store');
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: 'saved_successfully',
        post: saved,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save failed:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}
