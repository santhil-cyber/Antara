import React from 'react';
import LiveTitle from '@/components/LiveTitle';
import RealtimeList from '@/components/RealtimeList';
import AdminLoginForm from '@/components/AdminLoginForm';
import AdminHeader from '@/components/AdminHeader';
import { verifyAdminAccess } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | Antara',
  description: 'Real-time incident feed, case management, and emergency response dashboard.',
};

async function Page() {
  const auth = await verifyAdminAccess();

  if (!auth.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-md relative z-10">
          <AdminLoginForm isInline={true} redirectTo="/dashboard" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center mx-auto max-w-5xl w-full p-4 sm:p-6">
      <AdminHeader
        authSource={auth.source}
        adminName={auth.user?.fullName || 'Administrator'}
      />
      <div className="mb-4">
        <LiveTitle />
      </div>
      <RealtimeList />
    </div>
  );
}

export default Page;
