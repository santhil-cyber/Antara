'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Radio, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface AdminHeaderProps {
  authSource?: 'clerk' | 'session' | 'mock' | null;
  adminName?: string;
}

export default function AdminHeader({
  authSource = 'session',
  adminName = 'Administrator',
}: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      toast.success('Admin session closed.');
      setTimeout(() => {
        window.location.href = '/';
      }, 400);
    } catch {
      toast.error('Failed to log out.');
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 mb-6 shadow-xl border border-blue-500/20 relative overflow-hidden">
      {/* Decorative background flare */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Admin Command Center
              </h1>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Mode
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Authorized session ({authSource === 'clerk' ? 'Clerk Admin' : authSource === 'mock' ? 'Preview' : 'Master Passcode'}) &bull; Real-time case alerts & triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-xs border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl gap-1.5 h-9"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs bg-red-600/90 hover:bg-red-600 text-white rounded-xl gap-1.5 h-9 font-semibold shadow-md shadow-red-900/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? 'Signing out...' : 'Exit Admin'}
          </Button>
        </div>
      </div>
    </div>
  );
}
