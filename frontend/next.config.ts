import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@akxr/design-system", "@akxr/api"],
  env: {
    APP_ENV: process.env.APP_ENV,
    NEXT_PUBLIC_DC_ENDPOINT: process.env.NEXT_PUBLIC_DC_ENDPOINT,
  },
};

export default nextConfig;
