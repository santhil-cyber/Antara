import type { NextConfig } from 'next';
import path from 'path';

const isClerkConfigured =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('example.com') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('mock_');

const nextConfig: NextConfig = {
  images: {
    domains: [], // Allow images from any domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow images from any hostname
        port: '',
        pathname: '/**', // Allow any path
      },
    ],
  },
  webpack: (config) => {
    if (!isClerkConfigured) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@clerk/nextjs/server': path.resolve(__dirname, 'src/mock-clerk/server.ts'),
        '@clerk/nextjs': path.resolve(__dirname, 'src/mock-clerk/index.tsx'),
      };
    }
    return config;
  },
};

export default nextConfig;
