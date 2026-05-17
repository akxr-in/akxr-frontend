import type { NextConfig } from "next";

const apiUrls: Record<string, string> = {
  development: "http://localhost:3001",
  staging: "https://api-staging.akxr.in",
  production: "https://api.akxr.in",
};

const appEnv = process.env.APP_ENV ?? "development";
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? apiUrls[appEnv] ?? apiUrls.development;

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@akxr/design-system", "@akxr/api"],
  env: {
    APP_ENV: appEnv,
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_DC_ENDPOINT: process.env.NEXT_PUBLIC_DC_ENDPOINT,
  },
};

export default nextConfig;
