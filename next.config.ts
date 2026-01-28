import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow build to succeed even with type errors
    // Remove this in production after fixing all type errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
