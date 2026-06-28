import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller, modern image formats (AVIF first, WebP fallback) for the
  // project screenshots — several of which are 200 KB+ JPEGs at source.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  // Tree-shake icon/animation barrels so only the used exports ship.
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
};

export default nextConfig;
