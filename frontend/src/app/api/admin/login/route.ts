import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  validateAdminPasscode,
} from '@/lib/admin-auth';
import { clerkClient, currentUser } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const passcode = body.passcode || body.password;

    if (!passcode || !validateAdminPasscode(passcode)) {
      return NextResponse.json(
        {
          error: 'Invalid admin passcode. Please check credentials or consult system administrator.',
        },
        { status: 401 }
      );
    }

    // Try upgrading Clerk account if user is signed in with Clerk
    let clerkUpgraded = false;
    try {
      const user = await currentUser();
      if (user?.id) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(user.id, {
          unsafeMetadata: {
            ...user.unsafeMetadata,
            isAdmin: true,
          },
        });
        clerkUpgraded = true;
      }
    } catch (err) {
      console.warn('Clerk user upgrade skipped or failed:', err);
    }

    const token = createAdminToken();
    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      clerkUpgraded,
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during admin authentication.' },
      { status: 500 }
    );
  }
}
