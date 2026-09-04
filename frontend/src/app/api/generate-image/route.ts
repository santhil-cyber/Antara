import { NextResponse } from 'next/server';
import axios from 'axios';

interface GenerateImageRequestData {
  generatedText: string;
  imagePrompt: string;
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
];

export async function POST(req: Request) {
  try {
    const data: GenerateImageRequestData = await req.json();

    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-image`,
          { prompt: data.imagePrompt },
          { timeout: 4000 }
        );
        if (res.data?.image_urls && res.data.image_urls.length > 0) {
          return NextResponse.json({ images: res.data.image_urls }, { status: 200 });
        }
      } catch (backendErr) {
        console.warn('Backend image service unreachable, using fallback covers');
      }
    }

    return NextResponse.json({ images: fallbackImages }, { status: 200 });
  } catch (error) {
    console.error('Image generation failed, returning fallback images:', error);
    return NextResponse.json({ images: fallbackImages }, { status: 200 });
  }
}
