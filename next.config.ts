import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins: ["https://4a0e-179-82-0-26.ngrok-free.app"],
  output: 'export',
  images: {
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

    ]
  },
  //TODO: REMOVE THIS AFTER
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
