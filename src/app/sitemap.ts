import type { MetadataRoute } from "next";

import { getSortedPosts } from "@/lib/blog";
import { getSiteUrl } from "@/lib/seo";

function toValidDate(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/process`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms-of-service`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const posts = await getSortedPosts();
  const seenSlugs = new Set<string>();
  const postRoutes: MetadataRoute.Sitemap = [];

  for (const post of posts) {
    const slug = post.slug.trim();
    if (!slug || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    postRoutes.push({
      url: `${siteUrl}/blog/${encodeURIComponent(slug)}`,
      lastModified: toValidDate(post.date),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return [...staticRoutes, ...postRoutes];
}
