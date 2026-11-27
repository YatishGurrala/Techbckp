import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildNotionLeadBlocks,
  buildNotionLeadProperties,
  createNotionLead,
  isNotionLeadsConfigured,
  normalizeNotionDatabaseId,
  resetNotionSchemaCacheForTests,
} from "@/lib/notion-leads";

afterEach(() => {
  resetNotionSchemaCacheForTests();
  vi.restoreAllMocks();
});

describe("notion-leads", () => {
  it("validates and normalizes 32-char and dashed Notion database IDs", () => {
    expect(normalizeNotionDatabaseId("37921165c02b8088acc5f45842aa4a49")).toBe(
      "37921165-c02b-8088-acc5-f45842aa4a49",
    );
    expect(normalizeNotionDatabaseId("37921165-c02b-8088-acc5-f45842aa4a49")).toBe(
      "37921165-c02b-8088-acc5-f45842aa4a49",
    );
    expect(normalizeNotionDatabaseId("invalid-id")).toBeNull();
    expect(
      isNotionLeadsConfigured({
        NOTION_API_KEY: "ntn_test",
        NOTION_LEADS_DB_ID: "37921165c02b8088acc5f45842aa4a49",
      }),
    ).toBe(true);
    expect(isNotionLeadsConfigured({ NOTION_API_KEY: "ntn_test" })).toBe(false);
  });

  it("maps lead fields adaptively to matching Notion database schema properties", () => {
    const schema = {
      Name: { type: "title" },
      Email: { type: "email" },
      Company: { type: "rich_text" },
      Service: { type: "select" },
      Budget: { type: "select" },
      Timeline: { type: "rich_text" },
      Source: { type: "select" },
      "UTM Campaign": { type: "rich_text" },
      "Submitted At": { type: "date" },
    };

    const props = buildNotionLeadProperties(schema, {
      name: "Jane Founder",
      email: "jane@startup.io",
      company: "Startup Inc",
      service: "MVP development",
      budget: "$5k - $10k",
      timeline: "1-2 months",
      message: "Building a B2B SaaS MVP with auth and Stripe billing.",
      submittedAt: "2026-11-27T08:00:00.000Z",
      source: "app-cost-calculator",
      attribution: { utmCampaign: "mvp_2027" },
    });

    expect(props.Name).toEqual({
      title: [{ type: "text", text: { content: "Jane Founder — Startup Inc (MVP development)" } }],
    });
    expect(props.Email).toEqual({ email: "jane@startup.io" });
    expect(props.Service).toEqual({ select: { name: "MVP development" } });
    expect(props["Submitted At"]).toEqual({ date: { start: "2026-11-27T08:00:00.000Z" } });
  });

  it("includes full inquiry and attribution details in Notion page body blocks", () => {
    const blocks = buildNotionLeadBlocks({
      name: "Jane Founder",
      email: "jane@startup.io",
      service: "MVP development",
      budget: "$5k - $10k",
      timeline: "1-2 months",
      message: "Need an MVP launched quickly.",
      submittedAt: "2026-11-27T08:00:00.000Z",
      source: "website_contact_page",
      attribution: { utmSource: "google", toolSummary: "Estimated $6k-$10k" },
    });

    const serialized = JSON.stringify(blocks);
    expect(serialized).toContain("Need an MVP launched quickly.");
    expect(serialized).toContain("UTM Source: google");
    expect(serialized).toContain("Tool / Estimate Summary: Estimated $6k-$10k");
  });

  it("fetches schema and creates a Notion lead page via REST API", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            properties: {
              Name: { type: "title" },
              Email: { type: "email" },
              Service: { type: "select" },
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "page-123" }), { status: 200 }),
      );

    const result = await createNotionLead(
      {
        name: "Jane Founder",
        email: "jane@startup.io",
        service: "MVP development",
        budget: "$5k - $10k",
        timeline: "1-2 months",
        message: "We need an MVP web app with auth and billing.",
        submittedAt: "2026-11-27T08:00:00.000Z",
        source: "website_contact_page",
      },
      {
        env: {
          NOTION_API_KEY: "ntn_secret",
          NOTION_LEADS_DB_ID: "37921165c02b8088acc5f45842aa4a49",
        },
        fetchImpl: fetchSpy as unknown as typeof fetch,
      },
    );

    expect(result).toEqual({ pageId: "page-123" });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[0][0]).toBe(
      "https://api.notion.com/v1/databases/37921165-c02b-8088-acc5-f45842aa4a49",
    );
    expect(fetchSpy.mock.calls[1][0]).toBe("https://api.notion.com/v1/pages");
  });
});

