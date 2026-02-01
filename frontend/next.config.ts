import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@akxr/design-system", "@akxr/api"],
};

export default nextConfig;
