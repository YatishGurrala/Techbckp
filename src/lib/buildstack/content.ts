import type { BlogMeta, BlogPost } from "@/lib/blog";
import {
  audiences as fallbackAudiences,
  externalLinks,
  processSteps as fallbackProcess,
  qualification as fallbackQualification,
  services as fallbackServices,
} from "@/lib/site-data";

import { getPublicBlogBySlug, getPublicBlogs, getPublicContentBlock, getPublicPage } from "./public-client";

type UnknownRecord = Record<string, unknown>;

function toRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function parseJsonData<T>(raw: unknown, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  if (typeof raw === "object") return raw as T;
  return fallback;
}

function toBlogMeta(raw: Record<string, unknown>): BlogMeta {
  return {
    slug: asString(raw.slug),
    title: asString(raw.title),
    excerpt: asString(raw.excerpt),
    date: asString(raw.publishedAt) || asString(raw.updatedAt),
    category: asString(raw.category, "General"),
    readTime: asString(raw.readTime, "5 min read"),
    author: asString(raw.author, "Techbckp Team"),
  };
}

export async function getHomepageHeroHtml(): Promise<string | null> {
  const pageResult = await getPublicPage("home");
  if (pageResult.ok && pageResult.data?.contentHtml) {
    return pageResult.data.contentHtml;
  }

  const blockResult = await getPublicContentBlock("home-hero");
  if (blockResult.ok && blockResult.data?.contentHtml) {
    return blockResult.data.contentHtml;
  }

  return null;
}

export async function getHomepageServices() {
  const blockResult = await getPublicContentBlock("home-services");
  if (!blockResult.ok || !blockResult.data) return fallbackServices;

  const parsed = parseJsonData<{ services?: unknown[] }>(blockResult.data.data, {});
  const list = asArray(parsed.services)
    .map((item) => {
      const r = toRecord(item);
      return {
        name: asString(r.name),
        price: asString(r.price),
        duration: asString(r.duration),
        description: asString(r.description),
        includes: asArray(r.includes).map((value) => asString(value)).filter(Boolean),
        featured: Boolean(r.featured),
      };
    })
    .filter((item) => item.name && item.description);

  return list.length > 0 ? list : fallbackServices;
}

export async function getHomepageAudiences() {
  const blockResult = await getPublicContentBlock("home-audiences");
  if (!blockResult.ok || !blockResult.data) return fallbackAudiences;

  const parsed = parseJsonData<{ audiences?: unknown[] }>(blockResult.data.data, {});
  const list = asArray(parsed.audiences)
    .map((item) => {
      const r = toRecord(item);
      return {
        title: asString(r.title),
        body: asString(r.body),
      };
    })
    .filter((item) => item.title && item.body);

  return list.length > 0 ? list : fallbackAudiences;
}

export async function getHomepageProcessSteps() {
  const blockResult = await getPublicContentBlock("home-process");
  if (!blockResult.ok || !blockResult.data) return fallbackProcess;

  const parsed = parseJsonData<{ steps?: unknown[] }>(blockResult.data.data, {});
  const list = asArray(parsed.steps)
    .map((item) => {
      const r = toRecord(item);
      return {
        title: asString(r.title),
        subtitle: asString(r.subtitle),
        description: asString(r.description),
      };
    })
    .filter((item) => item.title && item.description);

  return list.length > 0 ? list : fallbackProcess;
}

export async function getHomepageQualification() {
  const blockResult = await getPublicContentBlock("home-qualification");
  if (!blockResult.ok || !blockResult.data) return fallbackQualification;

  const parsed = parseJsonData<{ goodFit?: unknown[]; notFit?: unknown[] }>(blockResult.data.data, {});
  const goodFit = asArray(parsed.goodFit).map((item) => asString(item)).filter(Boolean);
  const notFit = asArray(parsed.notFit).map((item) => asString(item)).filter(Boolean);

  return {
    goodFit: goodFit.length > 0 ? goodFit : fallbackQualification.goodFit,
    notFit: notFit.length > 0 ? notFit : fallbackQualification.notFit,
  };
}

export async function getHomepagePricing() {
  const blockResult = await getPublicContentBlock("home-pricing");
  if (!blockResult.ok || !blockResult.data) {
    return fallbackServices.map((service) => ({
      name: service.name,
      price: service.price,
      tagline: service.description,
      features: service.includes,
      ctaLabel: "Start Project",
      ctaHref: externalLinks.calendly,
      featured: service.featured,
    }));
  }

  const parsed = parseJsonData<{ tiers?: unknown[] }>(blockResult.data.data, {});
  const list = asArray(parsed.tiers)
    .map((item) => {
      const r = toRecord(item);
      return {
        name: asString(r.name),
        price: asString(r.price),
        tagline: asString(r.tagline) || asString(r.description),
        features: asArray(r.features).map((value) => asString(value)).filter(Boolean),
        ctaLabel: asString(r.ctaLabel, "Start Project"),
        ctaHref: asString(r.ctaHref, externalLinks.calendly),
        featured: Boolean(r.featured),
      };
    })
    .filter((item) => item.name && item.price);

  if (list.length > 0) return list;

  return fallbackServices.map((service) => ({
    name: service.name,
    price: service.price,
    tagline: service.description,
    features: service.includes,
    ctaLabel: "Start Project",
    ctaHref: externalLinks.calendly,
    featured: service.featured,
  }));
}

export async function getCmsBlogList(): Promise<BlogMeta[]> {
  const blogsResult = await getPublicBlogs();
  if (!blogsResult.ok) return [];

  const list = blogsResult.data
    .map((blog) =>
      toBlogMeta({
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt,
        publishedAt: blog.publishedAt,
        updatedAt: blog.updatedAt,
        category: blog.category,
        readTime: blog.readTime,
        author: blog.author,
      }),
    )
    .filter((item) => item.slug && item.title)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return list;
}

export async function getCmsBlogPost(slug: string): Promise<BlogPost | null> {
  const result = await getPublicBlogBySlug(slug);
  if (!result.ok || !result.data) return null;

  const blog = result.data;
  return {
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    date: blog.publishedAt || blog.updatedAt || "",
    category: blog.category || "General",
    readTime: blog.readTime || "5 min read",
    author: blog.author || "Techbckp Team",
    contentHtml: blog.contentHtml || "",
  };
}
