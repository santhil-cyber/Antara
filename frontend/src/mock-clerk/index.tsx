'use client';

import React, { createContext, useContext, useState } from 'react';

export const mockUser = {
  id: 'mock_user_123',
  fullName: 'Antara User',
  firstName: 'Antara',
  lastName: 'User',
  imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  primaryEmailAddress: {
    emailAddress: 'user@antara.local',
  },
  unsafeMetadata: {
    isAdmin: true,
  },
};

interface AuthContextType {
  isSignedIn: boolean;
  user: typeof mockUser | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: true,
  user: mockUser,
  signIn: () => {},
  signOut: () => {},
});

export function ClerkProvider({
  children,
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  const [isSignedIn, setIsSignedIn] = useState(true);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user: isSignedIn ? mockUser : null,
        signIn: () => setIsSignedIn(true),
        signOut: () => setIsSignedIn(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useClerk() {
  const { user, signOut, signIn } = useContext(AuthContext);
  return {
    user,
    loaded: true,
    signOut,
    openSignIn: signIn,
    openSignUp: signIn,
  };
}

export function useUser() {
  const { user, isSignedIn } = useContext(AuthContext);
  return {
    isLoaded: true,
    isSignedIn,
    user,
  };
}

export function useAuth() {
  const { user, isSignedIn, signOut } = useContext(AuthContext);
  return {
    isLoaded: true,
    isSignedIn,
    userId: user ? user.id : null,
    sessionId: user ? 'mock_session_123' : null,
    signOut,
  };
}

export function useSignIn() {
  const { signIn } = useContext(AuthContext);
  return {
    isLoaded: true,
    signIn: {
      create: async ({ identifier, password }: any) => {
        signIn();
        return { status: 'complete', createdSessionId: 'mock_session_123' };
      },
      authenticateWithRedirect: async ({ redirectUrlComplete }: any) => {
        signIn();
        if (typeof window !== 'undefined' && redirectUrlComplete) {
          window.location.href = redirectUrlComplete;
        }
      },
    },
    setActive: async ({ session }: any) => {
      signIn();
    },
  };
}

export function useSignUp() {
  const { signIn } = useContext(AuthContext);
  return {
    isLoaded: true,
    signUp: {
      create: async () => {
        signIn();
        return { status: 'complete', createdSessionId: 'mock_session_123' };
      },
      prepareEmailAddressVerification: async () => {},
      attemptEmailAddressVerification: async () => {
        signIn();
        return { status: 'complete', createdSessionId: 'mock_session_123' };
      },
    },
    setActive: async () => {
      signIn();
    },
  };
}

export function SignInButton({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) {
  const { signIn } = useContext(AuthContext);
  return <span onClick={() => signIn()}>{children || <button>Sign In</button>}</span>;
}

export function SignUpButton({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) {
  const { signIn } = useContext(AuthContext);
  return <span onClick={() => signIn()}>{children || <button>Sign Up</button>}</span>;
}

export function UserButton() {
  const { user, signOut } = useContext(AuthContext);
  if (!user) return null;
  return (
    <button onClick={() => signOut()} className="rounded-full w-8 h-8 overflow-hidden">
      <img src={user.imageUrl} alt={user.fullName} className="w-full h-full object-cover" />
    </button>
  );
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useContext(AuthContext);
  return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useContext(AuthContext);
  return !isSignedIn ? <>{children}</> : null;
}

export function AuthenticateWithRedirectCallback() {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
  return <div>Authenticating...</div>;
}
