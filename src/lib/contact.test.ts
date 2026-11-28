import { describe, expect, it } from "vitest";

import {
  buildPrefilledGmailUrl,
  buildPrefilledMailto,
  buildProjectBriefSubject,
  buildProjectBriefText,
  normalizeOptionSelection,
  normalizeServiceSelection,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/contact";

describe("contact brief builder helpers", () => {
  it("normalizes service slugs and labels for pre-filled links", () => {
    expect(normalizeServiceSelection("mvp-development")).toBe("MVP development");
    expect(normalizeServiceSelection("ai-automation")).toBe("AI automation and integrations");
    expect(normalizeServiceSelection("MVP Launch System")).toBe("MVP development");
    expect(normalizeServiceSelection("unknown-service")).toBe("");
    expect(normalizeOptionSelection("$5k - $10k", BUDGET_OPTIONS)).toBe("$5k - $10k");
    expect(normalizeOptionSelection("1-2 months", TIMELINE_OPTIONS)).toBe("1-2 months");
  });

  it("builds structured brief text, mailto URI, and Gmail compose URL", () => {
    const draft = {
      name: "Jane Founder",
      company: "Acme Labs",
      service: "MVP development",
      budget: "$5k - $10k",
      timeline: "1-2 months",
      estimate: "$6k-$10k",
      details: "Launching a web MVP with user auth and billing.",
    };

    expect(buildProjectBriefSubject(draft)).toBe(
      "Techbckp Project Inquiry: MVP development — Acme Labs",
    );

    const text = buildProjectBriefText(draft);
    expect(text).toContain("Service needed: MVP development");
    expect(text).toContain("Budget range: $5k - $10k");
    expect(text).toContain("Estimated scope: $6k-$10k");
    expect(text).toContain("Launching a web MVP with user auth and billing.");

    const mailto = buildPrefilledMailto("hello@techbckp.com", draft);
    expect(mailto.startsWith("mailto:hello@techbckp.com?subject=")).toBe(true);
    expect(mailto).toContain(encodeURIComponent("MVP development"));

    const gmail = buildPrefilledGmailUrl("hello@techbckp.com", draft);
    expect(gmail.startsWith("https://mail.google.com/mail/?")).toBe(true);
    expect(gmail).toContain("to=hello%40techbckp.com");
  });
});

