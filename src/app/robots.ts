import type { MetadataRoute } from "next";

import { getSiteUrl, isPreviewOrNoIndex } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // On preview deployments, allow crawlers to fetch pages so they can observe
  // the `X-Robots-Tag: noindex, nofollow` header and `<meta name="robots" content="noindex, nofollow">`,
  // while omitting the sitemap and disallowing API routes.
  if (isPreviewOrNoIndex()) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    };
  }

  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
