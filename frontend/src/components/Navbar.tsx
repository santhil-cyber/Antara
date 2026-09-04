'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Shield, ShieldCheck } from 'lucide-react';

function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isAdminSession, setIsAdminSession] = useState(false);

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
        }
      } catch {
        // Ignore network check failure
      }
    };
    checkAdmin();
  }, [pathname]);

  // Function to check if a link is active
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="w-full h-16 px-4 sm:px-6 flex items-center justify-between border-b shadow-sm bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <Link
        href={'/'}
        className="font-bold text-2xl tracking-wide hover:text-blue-500 transition-colors duration-200 flex items-center gap-1.5"
      >
        <span>Ant<span className="text-blue-700 dark:text-blue-500">ara</span></span>
      </Link>

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
        <Link
          href="/dashboard"
          className={`flex items-center gap-1.5 ${
            isActive('/dashboard')
              ? 'text-blue-700 dark:text-blue-400 font-semibold'
              : 'hover:text-blue-700 dark:hover:text-blue-400'
          } transition-colors duration-200`}
        >
          <span>Dashboard</span>
          {isAdmin && (
            <span className="text-[10px] bg-blue-600 text-white dark:bg-blue-500 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Admin
            </span>
          )}
        </Link>
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

      <div className="flex items-center gap-2.5">
        <ModeToggle />

        {/* Admin Portal Quick Access */}
        <Link href={isAdmin ? '/dashboard' : '/admin/login'}>
          <Button
            variant={isAdmin ? 'secondary' : 'outline'}
            size="sm"
            className={`gap-1 text-xs font-semibold rounded-lg h-8 px-2.5 ${
              isAdmin
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Admin Active</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Admin</span>
              </>
            )}
          </Button>
        </Link>

        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white">
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}

export default Navbar;
