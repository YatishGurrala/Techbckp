import { afterEach, describe, expect, it } from "vitest";

import robots from "@/app/robots";
import {
  absoluteUrl,
  buildBlogPostingJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  DEFAULT_SITE_URL,
  getSiteUrl,
  isPreviewOrNoIndex,
  serializeJsonLd,
} from "@/lib/seo";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("seo utilities", () => {
  it("defaults canonical site URL to https://www.techbckp.com", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.SITE_URL;

    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
    expect(absoluteUrl("/")).toBe("https://www.techbckp.com/");
    expect(absoluteUrl("/services")).toBe("https://www.techbckp.com/services");
  });

  it("uses configured NEXT_PUBLIC_SITE_URL origin consistently", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.techbckp.com/extra-path";
    expect(getSiteUrl()).toBe("https://www.techbckp.com");
  });

  it("builds unique per-page canonical URLs and OG metadata", () => {
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_NOINDEX;

    const servicesMeta = buildPageMetadata({
      title: "Services",
      description: "Execution systems",
      path: "/services",
    });

    expect(servicesMeta.alternates?.canonical).toBe("https://www.techbckp.com/services");
    expect(servicesMeta.openGraph?.url).toBe("https://www.techbckp.com/services");
    expect(servicesMeta.openGraph?.images).toEqual([
      {
        url: "https://www.techbckp.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Techbckp — Build · Automate · Grow",
      },
    ]);
    expect(servicesMeta.robots).toBeUndefined();
  });

  it("marks Vercel preview deployments noindex while keeping robots crawlable without sitemap", () => {
    process.env.VERCEL_ENV = "preview";

    expect(isPreviewOrNoIndex()).toBe(true);

    const meta = buildPageMetadata({
      title: "Pricing",
      description: "Pricing tiers",
      path: "/pricing",
    });
    expect(meta.robots).toEqual({ index: false, follow: false });

    const robotsConfig = robots();
    expect(robotsConfig).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    });
    expect(robotsConfig.sitemap).toBeUndefined();
  });

  it("allows public crawling and references canonical sitemap in production robots.txt", () => {
    process.env.VERCEL_ENV = "production";
    delete process.env.NEXT_PUBLIC_NOINDEX;

    const robotsConfig = robots();
    expect(robotsConfig.sitemap).toBe("https://www.techbckp.com/sitemap.xml");
    expect(robotsConfig.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    });
  });

  it("escapes < characters in serialized JSON-LD to prevent XSS", () => {
    const serialized = serializeJsonLd({
      headline: "</script><script>alert(1)</script>",
    });
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });

  it("builds factual Organization, FAQPage, and BlogPosting schemas", () => {
    const org = buildOrganizationJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(org.url).toBe("https://www.techbckp.com");

    const faq = buildFaqJsonLd([{ q: "Do you take equity?", a: "No, fixed fees." }]);
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity).toHaveLength(1);

    const postSchema = buildBlogPostingJsonLd({
      slug: "30-day-mvp-development-system",
      title: "30-Day MVP System",
      excerpt: "Build fast.",
      date: "2026-05-05",
      category: "Product Development",
      readTime: "8 min read",
      author: "Techbckp Team",
    });
    expect(postSchema["@type"]).toBe("BlogPosting");
    expect(postSchema.url).toBe("https://www.techbckp.com/blog/30-day-mvp-development-system");
    expect(postSchema.author).toEqual({ "@type": "Organization", name: "Techbckp Team" });
  });
});
