import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gif-avatars.com",
      },
    ],
  },
};

export default nextConfig;
