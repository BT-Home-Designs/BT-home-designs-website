import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Temporary stock photography (Unsplash License — free for commercial
    // use) is hotlinked from Unsplash's CDN until real BT Home Designs
    // project photography is available. See lib/data/media.ts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
