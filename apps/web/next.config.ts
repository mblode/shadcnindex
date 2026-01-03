import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*"],
  },
  serverExternalPackages: ["esbuild"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@phosphor-icons/react",
      "@tabler/icons-react",
      "@hugeicons/react",
    ],
  },
};
export default withBundleAnalyzer(nextConfig);
