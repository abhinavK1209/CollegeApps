import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Type errors fail the build. No shortcuts.
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Re-enable once every route in the sidebar exists. Until then it conflicts
  // with the config-driven nav, which intentionally lists not-yet-built routes.
  typedRoutes: false,
};

export default nextConfig;
