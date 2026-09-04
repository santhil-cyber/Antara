// app/api/posts/route.js
import axios from 'axios';
import { NextResponse } from 'next/server';

const mockPosts = [
  {
    id: 'post_1',
    Name: 'Priya Sharma',
    phone: '+91 98765 43210',
    state: 'Delhi',
    status: 'pending',
    currentSituation: 'Immediate assistance required with local authority follow-up.',
    occurrenceDuration: '2 weeks',
    frequency: 'Daily',
    visibleInjuries: 'Yes',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post_2',
    Name: 'Ananya Verma',
    phone: '+91 98123 45678',
    state: 'Maharashtra',
    status: 'in-progress',
    currentSituation: 'Counseling and legal advisory support requested.',
    occurrenceDuration: '1 month',
    frequency: 'Occasional',
    visibleInjuries: 'No',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-admin-posts`,
          { timeout: 4000 }
        );
        if (response.status === 200 && response.data) {
          return NextResponse.json(response.data, { status: 200 });
        }
      } catch (backendErr) {
        console.warn('Backend posts service unreachable, using fallback list');
      }
    }

    return NextResponse.json(mockPosts, { status: 200 });
  } catch (error) {
    return NextResponse.json(mockPosts, { status: 200 });
  }
}
