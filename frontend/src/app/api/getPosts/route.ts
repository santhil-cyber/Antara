import axios from 'axios';
import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const localPosts = getAllPosts();

    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-admin-posts`,
          { timeout: 3000 }
        );
        if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
          // Merge local posts (newest first) with backend posts, avoiding duplicates
          const seen = new Set(localPosts.map((p) => p._id));
          const merged = [...localPosts];
          for (const item of response.data) {
            const id = item._id || item.id;
            if (id && !seen.has(id)) {
              merged.push(item);
              seen.add(id);
            }
          }
          return NextResponse.json(merged, { status: 200 });
        }
      } catch (backendErr) {
        console.warn('Backend posts service unreachable, serving local Antara posts');
      }
    }

    return NextResponse.json(localPosts, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(getAllPosts(), { status: 200 });
  }
}
