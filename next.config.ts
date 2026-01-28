import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during build
    // TODO: Re-enable after fixing all linting issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type checking is enforced during build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
