import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the workspace package
  transpilePackages: ["@akxr/design-system"],
};

export default nextConfig;
