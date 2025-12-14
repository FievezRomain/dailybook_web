import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: true,
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
