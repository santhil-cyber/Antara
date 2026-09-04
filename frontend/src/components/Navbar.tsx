'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { usePathname, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  Sparkles,
  CheckCircle2,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const [isAdminSession, setIsAdminSession] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check admin status from cookie session or Clerk metadata
  const isClerkAdmin = Boolean((user?.unsafeMetadata as { isAdmin?: boolean })?.isAdmin);
  const isAdmin = isClerkAdmin || isAdminSession;

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/status');
        const data = await res.json();
        if (data?.isAdmin) {
          setIsAdminSession(true);
        } else {
          setIsAdminSession(false);
        }
      } catch {
        // Ignore network failure
      }
    };
    checkAdmin();
  }, [pathname]);

  const handleAdminLogin = async (codeToSubmit?: string) => {
    const code = codeToSubmit || passcode;
    if (!code.trim()) {
      setError('Please enter the admin passcode.');
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

      setIsAdminSession(true);
      setIsModalOpen(false);
      setPasscode('');
      toast.success('Admin mode enabled! Dashboard is now available.', {
        icon: '🛡️',
      });

      // Smoothly navigate to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid admin passcode');
      toast.error(err.message || 'Invalid admin passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAdminSession(false);
      toast.success('Exited Admin mode. Create Post restored.');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Failed to log out.');
    }
  };

  // Function to check if a link is active
  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="w-full h-16 px-4 sm:px-6 flex items-center justify-between border-b shadow-sm bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <Link
          href={'/'}
          className="font-bold text-2xl tracking-wide hover:text-blue-500 transition-colors duration-200 flex items-center gap-1.5"
        >
          <span>
            Ant<span className="text-blue-700 dark:text-blue-500">ara</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center justify-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
          <Link
            href="/"
            className={`${
              isActive('/')
                ? 'text-blue-700 dark:text-blue-400 font-semibold'
                : 'hover:text-blue-700 dark:hover:text-blue-400'
            } transition-colors duration-200`}
          >
            Home
          </Link>

          {/* When user enters password, Dashboard is here instead of Create Post */}
          {isAdmin ? (
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 ${
                isActive('/dashboard')
                  ? 'text-blue-700 dark:text-blue-400 font-semibold'
                  : 'hover:text-blue-700 dark:hover:text-blue-400'
              } transition-colors duration-200`}
            >
              <span>Dashboard</span>
              <span className="text-[10px] bg-blue-600 text-white dark:bg-blue-500 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Admin
              </span>
            </Link>
          ) : (
            <Link
              href="/create-post"
              className={`${
                isActive('/create-post')
                  ? 'text-blue-700 dark:text-blue-400 font-semibold'
                  : 'hover:text-blue-700 dark:hover:text-blue-400'
              } transition-colors duration-200`}
            >
              Create Post
            </Link>
          )}

          <Link
            href="/lawbot"
            className={`${
              isActive('/lawbot')
                ? 'text-blue-700 dark:text-blue-400 font-semibold'
                : 'hover:text-blue-700 dark:hover:text-blue-400'
            } transition-colors duration-200`}
          >
            Law Bot
          </Link>

          <Link
            href="/therapybot"
            className={`${
              isActive('/therapybot')
                ? 'text-blue-700 dark:text-blue-400 font-semibold'
                : 'hover:text-blue-700 dark:hover:text-blue-400'
            } transition-colors duration-200`}
          >
            Therapy Bot
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <ModeToggle />

          {/* Admin Control Button */}
          {isAdmin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminLogout}
              className="gap-1.5 text-xs font-semibold rounded-lg h-8 px-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
              title="Click to Exit Admin Mode"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Admin Active</span>
              <LogOut className="w-3 h-3 ml-0.5 opacity-60" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setIsModalOpen(true);
              }}
              className="gap-1.5 text-xs font-semibold rounded-lg h-8 px-2.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-800"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin</span>
            </Button>
          )}

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                size="sm"
                className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Admin Password Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md p-6 sm:p-7 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Admin Authentication
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Enter master passcode to switch the navbar to Dashboard and access emergency case triage.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdminLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Admin Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin passcode..."
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError(null);
                    }}
                    className="pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-blue-500 text-sm rounded-xl font-mono"
                    autoFocus
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
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400">
                  {error}
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
                    Enable Admin Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Access */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                  onClick={() => {
                    setPasscode('antara@admin2025');
                    handleAdminLogin('antara@admin2025');
                  }}
                  disabled={loading}
                  className="w-full text-xs font-semibold py-1.5 h-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  1-Click Admin Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
