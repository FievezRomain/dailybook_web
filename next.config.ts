import type { NextConfig } from "next";
import { SECURITY_HEADERS } from './src/shared/security/headers';
import { createStorageRemotePatterns } from './src/shared/security/storage-hostnames';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['firebase-admin'],
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  
  images: {
    remotePatterns: createStorageRemotePatterns(process.env.NEXT_PUBLIC_BUCKET_HOSTNAME),
  },
};

export default nextConfig;
