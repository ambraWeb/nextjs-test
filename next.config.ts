import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: 'incremental' // permette do adottarlo solo a route specificate
  }
};

export default nextConfig;
