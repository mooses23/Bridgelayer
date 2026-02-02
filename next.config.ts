import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // This skips ESLint during production builds on Vercel
    // You can still run `npm run lint` locally for code quality checks
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
