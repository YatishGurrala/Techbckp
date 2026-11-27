import type { NextConfig } from "next";

const isPreviewOrNoIndex =
  process.env.VERCEL_ENV === "preview" ||
  process.env.NEXT_PUBLIC_NOINDEX === "true";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    if (!isPreviewOrNoIndex) return [];
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "techbckp.com",
          },
        ],
        destination: "https://www.techbckp.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
