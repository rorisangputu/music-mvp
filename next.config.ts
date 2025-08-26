import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "i1.sndcdn.com",
      },
      {
        protocol: "https",
        hostname: "cmmg.co.za",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**", // allows Firebase Storage
      },
      {
        protocol: "https",
        hostname: "**.firebasestorage.app", // allows musicapp-e347f.firebasestorage.app
      },
    ],
  },
};

export default nextConfig;
