import { describe, expect, it } from "vitest";

import { __testUtils } from "./public-client";

describe("buildstack public response parsing", () => {
  it("unwraps envelope responses", () => {
    const payload = { data: { id: "1", slug: "home" } };
    const result = __testUtils.normalizeEnvelope<{ id: string; slug: string }>(payload);

    expect(result.id).toBe("1");
    expect(result.slug).toBe("home");
  });

  it("maps blog payload into normalized blog model", () => {
    const parsed = __testUtils.toBlog({
      _id: "blog_1",
      slug: "launch-fast",
      title: "Launch Fast",
      summary: "Practical guide",
      content: "<p>Hello</p>",
      topic: "Growth",
      authorName: "Techbckp Team",
      read_time: "4 min read",
      published_at: "2026-05-10",
    });

    expect(parsed.id).toBe("blog_1");
    expect(parsed.slug).toBe("launch-fast");
    expect(parsed.excerpt).toBe("Practical guide");
    expect(parsed.contentHtml).toBe("<p>Hello</p>");
    expect(parsed.category).toBe("Growth");
    expect(parsed.readTime).toBe("4 min read");
    expect(parsed.publishedAt).toBe("2026-05-10");
  });
});
