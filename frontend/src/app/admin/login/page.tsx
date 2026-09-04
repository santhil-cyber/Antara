import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Activity, Eye } from 'lucide-react';
import AdminLoginForm from '@/components/AdminLoginForm';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Administrator Login | Antara Safe Portal',
  description: 'Secure operational access for case workers, coordinators, and administrators.',
};

export default async function AdminLoginPage() {
  const auth = await verifyAdminAccess();
  if (auth.isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Antara Home
          </Link>
        </div>

        <AdminLoginForm redirectTo="/dashboard" />

        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Protected</p>
            <p className="text-[10px] text-slate-400">Encrypted Triage</p>
          </div>
          <div className="p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <Activity className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Realtime</p>
            <p className="text-[10px] text-slate-400">Live Case Feed</p>
          </div>
          <div className="p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <Lock className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Audited</p>
            <p className="text-[10px] text-slate-400">Restricted Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
