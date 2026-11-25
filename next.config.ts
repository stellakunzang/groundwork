import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright and some browsers open the app as 127.0.0.1. Next blocks those dev resources otherwise.
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
