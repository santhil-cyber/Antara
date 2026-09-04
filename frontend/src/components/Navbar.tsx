'use client';
import Link from 'next/link';
import React from 'react';
import { ModeToggle } from './ModeToggle';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from './ui/button';

function Navbar() {
  const pathname = usePathname(); // Get current path
  const { user } = useUser();

  // Function to check if a link is active
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="w-full h-16 p-4 flex items-center justify-between border-b shadow-sm">
      <Link
        href={'/'}
        className="font-bold text-2xl tracking-wide hover:text-blue-500 transition-colors duration-200"
      >
        Ant<span className="text-blue-700">ara</span>
      </Link>
      <div className="flex items-center justify-center gap-10 font-medium text-gray-600">
        <Link
          href="/"
          className={`${
            isActive('/')
              ? 'text-blue-700 font-semibold'
              : 'hover:text-blue-700'
          } transition-colors duration-200`}
        >
          Home
        </Link>
        <Link
          href="/create-post"
          className={`${
            isActive('/create-post')
              ? 'text-blue-700 font-semibold'
              : 'hover:text-blue-700'
          } transition-colors duration-200`}
        >
          Create Post
        </Link>
        {(user?.unsafeMetadata as { isAdmin: boolean })?.isAdmin && (
          <Link
            href="/dashboard"
            className={`${
              isActive('/dashboard')
                ? 'text-blue-700 font-semibold'
                : 'hover:text-blue-700'
            } transition-colors duration-200`}
          >
            Dashboard
          </Link>
        )}
        <Link
          href="/lawbot"
          className={`${
            isActive('/lawbot')
              ? 'text-blue-700 font-semibold'
              : 'hover:text-blue-700'
          } transition-colors duration-200`}
        >
          Law Bot
        </Link>
        <Link
          href="/therapybot"
          className={`${
            isActive('/therapybot')
              ? 'text-blue-700 font-semibold'
              : 'hover:text-blue-700'
            } transition-colors duration-200`}
        >
          Therapy Bot
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle />
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">
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
