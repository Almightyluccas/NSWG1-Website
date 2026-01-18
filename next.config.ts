import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // allowedDevOrigins: ["https://4a0e-179-82-0-26.ngrok-free.app"],
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "perscom.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "objectstorage.us-ashburn-1.oraclecloud.com",
        pathname: "/**",
      },
    ],
  },
  //TODO: REMOVE THIS AFTER
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
