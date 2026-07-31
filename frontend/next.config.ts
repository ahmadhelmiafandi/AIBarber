import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only apply standalone output for production deployment builds
  ...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),
};

export default nextConfig;
