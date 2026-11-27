import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/contact/route";
import { normalizeServiceSelection } from "@/lib/contact";
import { resetContactGuardsForTests } from "@/lib/contact-guard";
import { resetNotionSchemaCacheForTests } from "@/lib/notion-leads";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = global.fetch;

function makeRequest(body: unknown, ip = "203.0.113.10") {
  return new NextRequest("https://www.techbckp.com/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const VALID_PAYLOAD = {
  name: "Jane Founder",
  email: "jane@startup.io",
  company: "Startup Inc",
  service: "MVP development",
  budget: "$5k - $10k",
  timeline: "1-2 months",
  message: "We need an MVP web application with user authentication and Stripe billing.",
  website: "",
  attribution: {
    source: "app-cost-calculator",
    utmSource: "google",
    utmMedium: "organic",
    utmCampaign: "mvp_2027",
    toolSummary: "Estimated $6k-$10k",
  },
};

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  global.fetch = ORIGINAL_FETCH;
  resetContactGuardsForTests();
  resetNotionSchemaCacheForTests();
  vi.restoreAllMocks();
});

describe("contact normalization and /api/contact", () => {
  it("normalizes service slugs and labels for pre-filled links", () => {
    expect(normalizeServiceSelection("mvp-development")).toBe("MVP development");
    expect(normalizeServiceSelection("ai-automation")).toBe("AI automation and integrations");
    expect(normalizeServiceSelection("MVP Launch System")).toBe("MVP development");
    expect(normalizeServiceSelection("unknown-service")).toBe("");
  });

  it("returns 400 with fieldErrors on invalid input", async () => {
    const res = await POST(makeRequest({ name: "A", email: "bad", message: "short" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fieldErrors).toBeDefined();
    expect(json.fieldErrors.email).toBeTruthy();
    expect(json.fieldErrors.message).toBeTruthy();
  });

  it("silently discards honeypot submissions without calling external APIs", async () => {
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://hooks.example.com/leads";
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const res = await POST(makeRequest({ ...VALID_PAYLOAD, website: "https://spam.bot" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true, accepted: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 503 and never claims success when neither Notion nor webhook is configured", async () => {
    delete process.env.NOTION_API_KEY;
    delete process.env.NOTION_LEADS_DB_ID;
    delete process.env.CONTACT_FORM_WEBHOOK_URL;
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.GA_API_SECRET;

    const res = await POST(makeRequest(VALID_PAYLOAD));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.ok).toBeUndefined();
    expect(json.deliveryConfigured).toBe(false);
  });

  it("stores leads directly in Notion when NOTION_API_KEY + NOTION_LEADS_DB_ID are configured", async () => {
    process.env.NOTION_API_KEY = "ntn_live_secret";
    process.env.NOTION_LEADS_DB_ID = "37921165c02b8088acc5f45842aa4a49";
    delete process.env.CONTACT_FORM_WEBHOOK_URL;
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.GA_API_SECRET;

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
        new Response(JSON.stringify({ id: "notion-page-1" }), { status: 200 }),
      );
    global.fetch = fetchSpy as unknown as typeof fetch;

    const res = await POST(makeRequest(VALID_PAYLOAD));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, accepted: true, duplicate: false });
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // Duplicate resubmission within 5 minutes should NOT create a second Notion row.
    const dupRes = await POST(makeRequest(VALID_PAYLOAD));
    expect(dupRes.status).toBe(200);
    expect(await dupRes.json()).toEqual({ ok: true, accepted: true, duplicate: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("prevents simultaneous duplicate submissions from creating multiple Notion records", async () => {
    process.env.NOTION_API_KEY = "ntn_live_secret";
    process.env.NOTION_LEADS_DB_ID = "37921165c02b8088acc5f45842aa4a49";
    delete process.env.CONTACT_FORM_WEBHOOK_URL;

    let releaseCreate!: () => void;
    const createGate = new Promise<void>((resolve) => {
      releaseCreate = resolve;
    });

    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ properties: { Name: { type: "title" } } }),
          { status: 200 },
        ),
      )
      .mockImplementationOnce(async () => {
        await createGate;
        return new Response(JSON.stringify({ id: "notion-page-concurrent" }), { status: 200 });
      });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const firstPromise = POST(makeRequest(VALID_PAYLOAD, "203.0.113.50"));
    const secondPromise = POST(makeRequest(VALID_PAYLOAD, "203.0.113.50"));
    releaseCreate();

    const [firstRes, secondRes] = await Promise.all([firstPromise, secondPromise]);
    const bodies = await Promise.all([firstRes.json(), secondRes.json()]);

    expect(firstRes.status).toBe(200);
    expect(secondRes.status).toBe(200);
    expect(bodies.filter((b) => b.duplicate === true)).toHaveLength(1);
    expect(bodies.filter((b) => b.duplicate === false)).toHaveLength(1);
    // Schema lookup (1) + single Notion page creation (1) = 2 calls total.
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("prevents duplicate Notion records after partial delivery failure (Notion ok, secondary webhook fails)", async () => {
    process.env.NOTION_API_KEY = "ntn_live_secret";
    process.env.NOTION_LEADS_DB_ID = "37921165c02b8088acc5f45842aa4a49";
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://hooks.example.com/secondary";
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.GA_API_SECRET;

    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ properties: { Name: { type: "title" } } }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "notion-page-partial" }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response("Webhook down", { status: 500 }));
    global.fetch = fetchSpy as unknown as typeof fetch;

    const res = await POST(makeRequest(VALID_PAYLOAD, "203.0.113.51"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, accepted: true, duplicate: false });

    // Immediate retry must see duplicate=true and NOT create another Notion record.
    const retryRes = await POST(makeRequest(VALID_PAYLOAD, "203.0.113.51"));
    expect(retryRes.status).toBe(200);
    expect(await retryRes.json()).toEqual({ ok: true, accepted: true, duplicate: true });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("returns 502 when configured delivery fails", async () => {
    delete process.env.NOTION_API_KEY;
    delete process.env.NOTION_LEADS_DB_ID;
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://hooks.example.com/leads";
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.GA_API_SECRET;

    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response("Upstream error", { status: 500 })) as unknown as typeof fetch;

    const res = await POST(makeRequest(VALID_PAYLOAD));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.ok).toBeUndefined();
    expect(json.error).toContain("hello@techbckp.com");
  });

  it("enforces per-IP rate limiting with 429 and Retry-After header", async () => {
    delete process.env.NOTION_API_KEY;
    delete process.env.NOTION_LEADS_DB_ID;
    delete process.env.CONTACT_FORM_WEBHOOK_URL;
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.GA_API_SECRET;

    for (let i = 0; i < 5; i++) {
      await POST(makeRequest({ name: "A" }, "198.51.100.7"));
    }

    const limited = await POST(makeRequest({ name: "A" }, "198.51.100.7"));
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("returns 200 with webhook delivery and avoids duplicate GA4 server conversion", async () => {
    delete process.env.NOTION_API_KEY;
    delete process.env.NOTION_LEADS_DB_ID;
    process.env.CONTACT_FORM_WEBHOOK_URL = "https://hooks.example.com/leads";
    process.env.CONTACT_FORM_WEBHOOK_SECRET = "super-secret";
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123456";
    process.env.GA_API_SECRET = "ga-secret";

    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ received: true }), { status: 200 }));
    global.fetch = fetchSpy as unknown as typeof fetch;

    const res = await POST(makeRequest(VALID_PAYLOAD));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, accepted: true, duplicate: false });

    // Only the lead webhook should be called — no duplicate GA4 MP conversion call.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://hooks.example.com/leads");
    expect((init as RequestInit).headers).toMatchObject({
      "Content-Type": "application/json",
      "x-contact-form-secret": "super-secret",
    });

    const sentPayload = JSON.parse(String((init as RequestInit).body));
    expect(sentPayload.source).toBe("app-cost-calculator");
    expect(sentPayload.attribution).toMatchObject({
      utmSource: "google",
      utmCampaign: "mvp_2027",
      toolSummary: "Estimated $6k-$10k",
    });
  });
});
