import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function GET() {
  try {
    const auth = await verifyAdminAccess();
    return NextResponse.json({
      isAdmin: auth.isAdmin,
      source: auth.source,
      user: auth.user ? { fullName: auth.user.fullName, email: auth.user.primaryEmailAddress?.emailAddress } : null,
    });
  } catch (error) {
    return NextResponse.json({ isAdmin: false, source: null });
  }
}
