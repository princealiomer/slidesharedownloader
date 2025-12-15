import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.slidesharecdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.slidesharecdn.com',
      }
    ],
  },
};

export default nextConfig;
