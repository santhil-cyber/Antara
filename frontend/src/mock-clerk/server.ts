import { NextResponse } from 'next/server';
import { mockUser } from './index';

export function clerkMiddleware(handler?: any) {
  return (req: any) => {
    if (handler) {
      return handler(() => {}, req);
    }
    return NextResponse.next();
  };
}

export async function currentUser() {
  return mockUser;
}

export function auth() {
  return {
    userId: mockUser.id,
    sessionId: 'mock_session_123',
    sessionClaims: {
      metadata: mockUser.unsafeMetadata,
    },
  };
}
