import { describe, expect, it } from "vitest";

import { getPostBySlug, getSortedPosts } from "@/lib/blog";

describe("local markdown blog loader", () => {
  it("loads all 5 published local markdown posts sorted by date desc", async () => {
    const posts = await getSortedPosts();
    expect(posts).toHaveLength(5);

    const slugs = posts.map((p) => p.slug);
    expect(slugs).toContain("30-day-mvp-development-system");
    expect(slugs).toContain("automation-for-niche-businesses");
    expect(slugs).toContain("high-converting-content-systems");
    expect(slugs).toContain("scalable-mvp-30-days");
    expect(slugs).toContain("why-most-startups-fail-before-launch");
  });

  it("preserves legacy slug alias and renders HTML content", async () => {
    const aliased = await getPostBySlug("from-idea-to-mvp-in-45-days");
    expect(aliased.slug).toBe("30-day-mvp-development-system");
    expect(aliased.contentHtml).toContain("<p>");
  });

  it("throws for unknown blog slugs so the route returns 404", async () => {
    await expect(getPostBySlug("does-not-exist-xyz")).rejects.toThrow("Post not found");
  });
});

