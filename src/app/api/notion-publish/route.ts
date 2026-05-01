import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createHmac, timingSafeEqual } from "node:crypto";

import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  extractPageId,
  extractSlug,
  extractSlugFromWebhookBody,
  extractStatus,
  extractStatusFromWebhookBody,
  fetchNotionPage,
  isPublishedStatus,
  isValidSlug,
} from "@/lib/notion-core";

// Notion CMS publish webhook.
//
// Two callers are supported:
//
// 1) The official Notion webhook subscription. Notion first POSTs a body
//    containing `verification_token`; we must echo it back. After we save the
//    token in Vercel as NOTION_VERIFICATION_TOKEN, every subsequent event is
//    signed with HMAC-SHA256 in `X-Notion-Signature` (format `sha256=<hex>`).
//
// 2) Our own automations / `/api/notion-test`, which authenticate with a
//    shared secret in the `x-notion-secret` header (NOTION_WEBHOOK_SECRET).
//
// Either authenticated path triggers a full marketing-surface revalidation.

export const dynamic = "force-dynamic";

function analyticsEnv() {
  return {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    apiSecret: process.env.GA_API_SECRET,
  };
}

function safeEqualHex(a: string, b: string) {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length === 0 || aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

function verifyNotionSignature(rawBody: string, header: string | null) {
  const verificationToken = process.env.NOTION_VERIFICATION_TOKEN ?? "";
  if (!verificationToken || !header) return false;
  const provided = header.startsWith("sha256=") ? header.slice(7) : header;
  const expected = createHmac("sha256", verificationToken).update(rawBody).digest("hex");
  return safeEqualHex(expected, provided);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // -------------------------------------------------------------------------
  // Auth: accept either our shared secret OR Notion's signed payload OR
  // Notion's one-time verification handshake.
  // -------------------------------------------------------------------------
  const sharedSecret = process.env.NOTION_WEBHOOK_SECRET ?? "";
  const providedSecret = req.headers.get("x-notion-secret") ?? "";
  const sharedSecretOk = Boolean(sharedSecret && providedSecret === sharedSecret);

  const signatureHeader = req.headers.get("x-notion-signature");
  const signatureOk = verifyNotionSignature(rawBody, signatureHeader);

  let parsed: Record<string, unknown> = {};
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Notion verification handshake. The first request after creating a
  // subscription contains a `verification_token`. We must echo it back so
  // Notion can confirm we own this URL. The token must then be stored in env
  // as NOTION_VERIFICATION_TOKEN so future events can be signature-verified.
  const verificationToken =
    typeof parsed.verification_token === "string" ? parsed.verification_token : "";
  if (verificationToken) {
    // Surface the token in Vercel function logs so you can paste it into the
    // Notion "Verify subscription" dialog. Save it to env as
    // NOTION_VERIFICATION_TOKEN so future events can be HMAC-verified.
    console.log("[notion-publish] verification_token=", verificationToken);
    await trackAnalyticsEvent({
      eventName: "notion_publish_verification",
      env: analyticsEnv(),
    });
    return NextResponse.json({ verification_token: verificationToken }, { status: 200 });
  }

  if (!sharedSecretOk && !signatureOk) {
    await trackAnalyticsEvent({
      eventName: "notion_publish_unauthorized",
      env: analyticsEnv(),
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow ping-style probes from the test console.
  if (parsed.test === true) {
    return NextResponse.json({ ok: true, mode: "test" }, { status: 200 });
  }

  await trackAnalyticsEvent({
    eventName: "notion_publish_received",
    params: { authVia: signatureOk ? "signature" : "shared_secret" },
    env: analyticsEnv(),
  });

  let slug = extractSlugFromWebhookBody(parsed);
  let status = extractStatusFromWebhookBody(parsed);

  // If the webhook payload only includes a page id, fetch the live page so we
  // get the freshest slug + status from Notion.
  const pageId = extractPageId(parsed);
  const apiKey = process.env.NOTION_API_KEY ?? "";

  if (pageId && apiKey && (!slug || !status)) {
    const properties = await fetchNotionPage(pageId, apiKey);
    if (properties) {
      if (!slug) slug = extractSlug(properties);
      if (!status) status = extractStatus(properties);
    }
  }

  if (status && !isPublishedStatus(status)) {
    await trackAnalyticsEvent({
      eventName: "notion_publish_skipped",
      params: { reason: "not_published", status },
      env: analyticsEnv(),
    });
    return NextResponse.json({ ok: false, reason: "not_published", status }, { status: 200 });
  }

  const hasValidSlug = Boolean(slug && isValidSlug(slug));

  try {
    // Always revalidate the full marketing surface — Collections / prose page
    // edits do not have a slug, but they still affect these pages.
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/services");
    revalidatePath("/process");
    revalidatePath("/pricing");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/privacy-policy");
    revalidatePath("/terms-of-service");
    if (hasValidSlug) {
      revalidatePath(`/blog/${slug}`);
    }
  } catch (err) {
    await trackAnalyticsEvent({
      eventName: "notion_publish_failed",
      params: { message: err instanceof Error ? err.message : "unknown_error" },
      env: analyticsEnv(),
    });
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }

  await trackAnalyticsEvent({
    eventName: "notion_publish_revalidated",
    params: { slug: slug || null, hasValidSlug },
    env: analyticsEnv(),
  });

  return NextResponse.json({ ok: true, slug: slug || null }, { status: 200 });
}
