import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io', 
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com', 
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
