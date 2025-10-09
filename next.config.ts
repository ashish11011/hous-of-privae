// import type { NextConfig } from "next";

// const nextConfig = {
//   images: {
//     // Disable Next.js image optimization so all external images are allowed
//     unoptimized: true,
//   },
// };

// module.exports = nextConfig;

// export default nextConfig;

// ✅ Correct: CommonJS export
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./image/loader.ts",
  },
  trailingSlash: true,
};

module.exports = nextConfig;
