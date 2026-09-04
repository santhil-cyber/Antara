'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface AdminLoginFormProps {
  redirectTo?: string;
  isInline?: boolean;
}

export default function AdminLoginForm({
  redirectTo = '/dashboard',
  isInline = false,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (codeToSubmit?: string) => {
    const code = codeToSubmit || passcode;
    if (!code.trim()) {
      setError('Please enter the administrator passcode.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      toast.success('Admin authorization granted! Redirecting...', {
        icon: '🛡️',
        duration: 3000,
      });

      // Force full page reload or router push to refresh server components
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator passcode');
      toast.error(err.message || 'Invalid administrator passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = () => {
    setPasscode('antara@admin2025');
    handleLogin('antara@admin2025');
  };

  return (
    <div
      className={`w-full max-w-md mx-auto ${
        isInline
          ? 'p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl rounded-2xl'
          : 'p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl'
      }`}
    >
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Shield className="w-7 h-7" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-white" />
          </div>
        </div>

        <span className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 mb-2">
          Restricted Portal
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Admin Authorization
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          Enter master passkey to access live incident reports, telemetry, and case triage.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
            Admin Passcode
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter master passkey..."
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(null);
              }}
              className="pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 text-sm rounded-xl font-mono"
              autoFocus={!isInline}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Unlock Dashboard <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Quick Demo Access Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Default Passcode
            </span>
            <code className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
              antara@admin2025
            </code>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleQuickDemoAccess}
            disabled={loading}
            className="w-full text-xs font-semibold py-1.5 h-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            1-Click Admin Access
          </Button>
        </div>
      </div>
    </div>
  );
}
