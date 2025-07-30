import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Keep this for direct HTTP links
        hostname: 'www.serebii.net',
        port: '',
        pathname: '/pokemongo/pokemon/**',
      },
      {
        protocol: 'https', // Add this for potential HTTPS redirects
        hostname: 'www.serebii.net',
        port: '',
        pathname: '/pokemongo/pokemon/**',
      },
    ],
  },
};

export default nextConfig;
