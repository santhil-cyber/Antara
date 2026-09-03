import LiveTitle from '@/components/LiveTitle';
import RealtimeList from '@/components/RealtimeList';
import { currentUser } from '@clerk/nextjs/server';
import React from 'react';

const isMockMode =
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('example.com') ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('mock_');

async function Page() {
  let user: any = null;
  if (isMockMode) {
    user = {
      unsafeMetadata: { isAdmin: true },
    };
  } else {
    try {
      user = await currentUser();
    } catch {
      user = null;
    }
  }

  if (!user?.unsafeMetadata?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Not Authorized</h2>
        <p className="text-gray-600">
          You must be logged in as an administrator to view the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className=" flex flex-col justify-center mx-auto max-w-5xl w-full p-4">
      <LiveTitle />
      <RealtimeList />
    </div>
  );
}

export default Page;
