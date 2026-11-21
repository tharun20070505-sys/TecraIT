import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
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
