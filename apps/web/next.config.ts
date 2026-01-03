import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

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
    urlImports: ["*"],
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.md",
        destination: "/llm/:path*",
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
