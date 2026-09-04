import type { Metadata } from 'next';
import './globals.css';
import { Roboto } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Antara',
  description: 'A Silent Shield, A Strong Voice - Empowering safety, legal guidance, and mental health support.',
};

const roboto = Roboto({
  weight: ['100', '300', '500', '400', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.className} antialiased`}
        suppressHydrationWarning
      >
        <ClerkProvider
          dynamic
          appearance={{
            variables: {
              colorPrimary: '#1d4ed8',
              colorBackground: '#ffffff',
              colorText: '#0f172a',
              colorInputBackground: '#ffffff',
              colorInputText: '#0f172a',
              borderRadius: '0.75rem',
            },
            elements: {
              modalBackdrop: 'bg-black/60 backdrop-blur-sm',
              modalContent: 'bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden',
              card: 'bg-white',
              cardBox: 'bg-white shadow-2xl rounded-2xl',
            },
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="h-screen flex flex-col">
              <Navbar />
              <main className="flex flex-1 flex-col">{children}</main>
            </div>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
