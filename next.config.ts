import type { NextConfig } from "next";

const nextConfig = {
  images: {
    // Disable Next.js image optimization so all external images are allowed
    unoptimized: true,
  },
};

module.exports = nextConfig;

export default nextConfig;
