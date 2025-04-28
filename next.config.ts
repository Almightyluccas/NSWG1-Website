import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      }
    ]
  }
  /* config options here */
};

export default nextConfig;
