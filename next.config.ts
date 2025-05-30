import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Disable ESLint during production builds
  eslint: {
    // This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    };
    return config;
  },
};

export default nextConfig;
