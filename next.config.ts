import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  compress: true,
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
