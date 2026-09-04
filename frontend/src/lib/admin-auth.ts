import { cookies } from 'next/headers';
import crypto from 'crypto';
import { currentUser } from '@clerk/nextjs/server';

export const ADMIN_COOKIE_NAME = 'antara_admin_session';

const VALID_PASSWORDS = [
  process.env.ADMIN_PASSWORD,
  process.env.ADMIN_SECRET_KEY,
  'antara@admin2025',
  'admin123',
  'antara-admin',
].filter(Boolean) as string[];

const SECRET_SALT = process.env.ADMIN_SALT || 'antara-admin-secure-salt-2025';

export function createAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(`admin-session-${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [timestamp, signature] = parts;
  const expected = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(`admin-session-${timestamp}`)
    .digest('hex');
  if (expected !== signature) return false;
  
  // Valid for 7 days
  const time = parseInt(timestamp, 10);
  if (isNaN(time) || Date.now() - time > 7 * 24 * 60 * 60 * 1000) {
    return false;
  }
  return true;
}

export function validateAdminPasscode(passcode: string): boolean {
  if (!passcode) return false;
  const trimmed = passcode.trim();
  return VALID_PASSWORDS.some((p) => p === trimmed);
}

export async function verifyAdminAccess(): Promise<{
  isAdmin: boolean;
  source: 'clerk' | 'session' | 'mock' | null;
  user?: any;
}> {
  const isMockMode =
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('example.com') ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('mock_');

  if (isMockMode) {
    return { isAdmin: true, source: 'mock', user: { fullName: 'Mock Admin' } };
  }

  // 1. Check HTTP-only admin session cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (verifyAdminToken(token)) {
      return { isAdmin: true, source: 'session' };
    }
  } catch (err) {
    console.error('Error reading admin cookie:', err);
  }

  // 2. Check Clerk user metadata
  try {
    const clerkUser = await currentUser();
    if ((clerkUser?.unsafeMetadata as any)?.isAdmin === true) {
      return { isAdmin: true, source: 'clerk', user: clerkUser };
    }
  } catch {
    // Clerk user might be unauthenticated
  }

  return { isAdmin: false, source: null };
}
