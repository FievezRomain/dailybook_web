import type { NextConfig } from "next";
import { SECURITY_HEADERS } from './src/shared/security/headers';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['firebase-admin'],
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_BUCKET_HOSTNAME || '',
        port: '',
        pathname: '/**', // autorise toutes les images de ce domaine
      },
    ],
  },
};

export default nextConfig;
