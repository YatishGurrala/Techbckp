import type { Metadata } from "next";

import type { BlogMeta } from "@/lib/blog";
import type { Service } from "@/lib/site-data";

export const DEFAULT_SITE_URL = "https://www.techbckp.com";
export const SITE_NAME = "Techbckp";
export const SITE_TAGLINE = "Build · Automate · Grow";
export const DEFAULT_TITLE = "Techbckp | Execution Partner for Founders & Growing Businesses";
export const DEFAULT_DESCRIPTION =
  "Techbckp helps founders, coaches, creators, and growing businesses build MVPs, automate workflows, and launch conversion-focused websites without hiring a full tech team.";

export function getContactEmail(): string {
  return (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@techbckp.com").trim();
}

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  const value = String(envUrl ?? "").trim();

  if (!value) return DEFAULT_SITE_URL;

  try {
    return new URL(value).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function isPreviewOrNoIndex(): boolean {
  return (
    process.env.VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_NOINDEX === "true"
  );
}

export function absoluteUrl(pathname = "/"): string {
  const base = getSiteUrl();
  if (!pathname || pathname === "/") return `${base}/`;
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${normalized}`;
}

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  useAbsoluteTitle?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  authors,
  noIndex = false,
  useAbsoluteTitle = false,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const blockIndexing = noIndex || isPreviewOrNoIndex();
  const fullTitle = useAbsoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: useAbsoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
    },
    ...(blockIndexing
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
      ...(type === "article"
        ? {
            ...(publishedTime ? { publishedTime } : {}),
            ...(authors && authors.length > 0 ? { authors } : {}),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl("/opengraph-image")],
    },
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();
  const email = getContactEmail();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/bkp_Orange.png`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email,
        url: `${siteUrl}/contact`,
      },
    ],
  };
}

export function buildWebsiteJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}

export function buildServicesJsonLd(services: Service[]) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} Services`,
    url: `${siteUrl}/services`,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: siteUrl,
        },
      },
    })),
  };
}

export function buildFaqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildBlogPostingJsonLd(post: BlogMeta) {
  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/blog/${encodeURIComponent(post.slug)}`;
  const parsedDate = post.date ? new Date(post.date) : null;
  const isoDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString()
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    ...(isoDate ? { datePublished: isoDate } : {}),
    ...(post.category ? { articleSection: post.category } : {}),
    author: {
      "@type": post.author && post.author !== "Techbckp Team" ? "Person" : "Organization",
      name: post.author || `${SITE_NAME} Team`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/bkp_Orange.png`,
      },
    },
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
