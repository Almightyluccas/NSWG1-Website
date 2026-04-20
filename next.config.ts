import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/operations",
        destination: "/dashboard/operations",
        permanent: true,
      },
      {
        source: "/operations/:path*",
        destination: "/dashboard/operations/:path*",
        permanent: true,
      },
      {
        source: "/calendar",
        destination: "/dashboard/calendar",
        permanent: true,
      },
      {
        source: "/calendar/:path*",
        destination: "/dashboard/calendar/:path*",
        permanent: true,
      },
      {
        source: "/forms",
        destination: "/dashboard/forms",
        permanent: true,
      },
      {
        source: "/forms/:path*",
        destination: "/dashboard/forms/:path*",
        permanent: true,
      },
      {
        source: "/documents",
        destination: "/dashboard/documents",
        permanent: true,
      },
      {
        source: "/documents/:path*",
        destination: "/dashboard/documents/:path*",
        permanent: true,
      },
      {
        source: "/perscom",
        destination: "/dashboard/perscom",
        permanent: true,
      },
      {
        source: "/perscom/:path*",
        destination: "/dashboard/perscom/:path*",
        permanent: true,
      },
      {
        source: "/settings",
        destination: "/dashboard/settings",
        permanent: true,
      },
    ];
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // allowedDevOrigins: ["https://4a0e-179-82-0-26.ngrok-free.app"],
  images: {
    // minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
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

};

export default nextConfig;
