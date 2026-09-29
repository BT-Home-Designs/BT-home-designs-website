import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // This site lives in a subfolder of the BT Home Designs repository and is
  // deployed as its own Vercel project (Root Directory: bt-custom-shades).
  // Pin the tracing root here so Next.js doesn't treat the parent repo
  // (which has its own package-lock.json) as this project's root.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Temporary stock photography (Unsplash License — free for commercial
    // use) is hotlinked from Unsplash's CDN until real BT Custom Shades
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
