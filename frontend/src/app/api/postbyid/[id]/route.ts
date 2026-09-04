import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-post/${id}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (response.ok) {
          const post = await response.json();
          return NextResponse.json(post);
        }
      } catch (e) {
        console.warn('Backend get-post unreachable, using fallback post');
      }
    }

    return NextResponse.json({
      id: id || 'post_1',
      Name: 'Priya Sharma',
      phone: '+91 98765 43210',
      state: 'Delhi',
      status: 'pending',
      currentSituation: 'Immediate assistance required with local authority follow-up.',
      occurrenceDuration: '2 weeks',
      frequency: 'Daily',
      visibleInjuries: 'Yes',
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      id: id || 'post_1',
      Name: 'Priya Sharma',
      phone: '+91 98765 43210',
      state: 'Delhi',
      status: 'pending',
      currentSituation: 'Immediate assistance required with local authority follow-up.',
      occurrenceDuration: '2 weeks',
      frequency: 'Daily',
      visibleInjuries: 'Yes',
      createdAt: new Date().toISOString(),
    });
  }
}
