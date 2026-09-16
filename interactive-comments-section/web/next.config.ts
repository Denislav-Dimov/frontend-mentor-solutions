import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const base = process.env.API_URL ?? 'http://localhost:5217';
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
