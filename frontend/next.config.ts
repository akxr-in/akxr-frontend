import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@akxr/design-system", "@akxr/api"],
  env: {
    APP_ENV: process.env.APP_ENV,
  },
};

export default nextConfig;
