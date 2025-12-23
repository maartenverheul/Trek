import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep knex server-only and configure Turbopack
  serverExternalPackages: ["knex"],
  experimental: {
    serverActions: {},
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tile.openstreetmap.org",
      },
      {
        protocol: "https",
        hostname: "*.basemaps.cartocdn.com",
      },
      {
        protocol: "https",
        hostname: "server.arcgisonline.com",
      },
      {
        protocol: "https",
        hostname: "a.tile.openstreetmap.org",
      },
      {
        protocol: "https",
        hostname: "b.tile.openstreetmap.org",
      },
      {
        protocol: "https",
        hostname: "c.tile.openstreetmap.org",
      },
    ],
  },
};

export default nextConfig;
