import { NextResponse, type NextRequest } from "next/server";

import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  isContactWebhookConfigured,
  type ContactAttribution,
  type ContactSubmissionInput,
} from "@/lib/contact";
import {
  acquireSubmissionLock,
  checkContactRateLimit,
  computeSubmissionFingerprint,
  extractClientIp,
  recordAcceptedSubmission,
  releaseSubmissionLock,
} from "@/lib/contact-guard";
import { createNotionLead, isNotionLeadsConfigured } from "@/lib/notion-leads";
import { getContactEmail } from "@/lib/seo";

export const dynamic = "force-dynamic";

function analyticsEnv() {
  return {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    apiSecret: process.env.GA_API_SECRET,
  };
}

function cleanValue(input: unknown, maxLength = 500) {
  return typeof input === "string" ? input.trim().slice(0, maxLength) : "";
}

function cleanAttributionToken(input: unknown, maxLength = 120): string | undefined {
  const value = cleanValue(input, maxLength);
  if (!value) return undefined;
  // Strip accidental email addresses from attribution metadata.
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) return undefined;
  return value;
}

function parseAttribution(raw: unknown): ContactAttribution {
  if (!raw || typeof raw !== "object") return {};
  const record = raw as Record<string, unknown>;
  const attribution: ContactAttribution = {
    source: cleanAttributionToken(record.source, 120),
    referrerPath: cleanAttributionToken(record.referrerPath, 200),
    utmSource: cleanAttributionToken(record.utmSource, 120),
    utmMedium: cleanAttributionToken(record.utmMedium, 120),
    utmCampaign: cleanAttributionToken(record.utmCampaign, 120),
    utmContent: cleanAttributionToken(record.utmContent, 120),
    utmTerm: cleanAttributionToken(record.utmTerm, 120),
    toolSummary: cleanAttributionToken(record.toolSummary, 500),
  };

  return Object.fromEntries(
    Object.entries(attribution).filter(([, value]) => Boolean(value)),
  ) as ContactAttribution;
}

function parseBody(raw: Record<string, unknown>): ContactSubmissionInput {
  return {
    name: cleanValue(raw.name, 200),
    email: cleanValue(raw.email, 254),
    company: cleanValue(raw.company, 200),
    service: cleanValue(raw.service, 120),
    budget: cleanValue(raw.budget, 80),
    timeline: cleanValue(raw.timeline, 80),
    message: cleanValue(raw.message, 3500),
    website: cleanValue(raw.website, 200),
    attribution: parseAttribution(raw.attribution),
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(input: ContactSubmissionInput) {
  const errors: Partial<Record<keyof ContactSubmissionInput, string>> = {};

  if (!input.name || input.name.length < 2) {
    errors.name = "Please enter your full name.";
  }
  if (!input.email || !isValidEmail(input.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!input.service) {
    errors.service = "Please choose the service you need.";
  }
  if (!input.budget) {
    errors.budget = "Please select your budget range.";
  }
  if (!input.timeline) {
    errors.timeline = "Please select your preferred timeline.";
  }
  if (!input.message || input.message.length < 20) {
    errors.message = "Please provide at least 20 characters about your request.";
  }
  if (input.name.length > 100) {
    errors.name = "Name is too long.";
  }
  if (input.company && input.company.length > 120) {
    errors.company = "Company name is too long.";
  }
  if (input.message.length > 3000) {
    errors.message = "Please keep the message under 3000 characters.";
  }

  return errors;
}

export async function POST(req: NextRequest) {
  const clientIp = extractClientIp(req.headers);
  const rateCheck = checkContactRateLimit(clientIp);
  if (!rateCheck.allowed) {
    await trackAnalyticsEvent({
      eventName: "contact_form_rate_limited",
      params: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      env: analyticsEnv(),
    });

    return NextResponse.json(
      {
        error: "Too many requests right now. Please wait a few minutes or email us directly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
      },
    );
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseBody(raw);

  // Honeypot field: silently discard likely bot traffic without triggering delivery or analytics.
  if (input.website) {
    return NextResponse.json({ ok: true, accepted: false }, { status: 200 });
  }

  const errors = validate(input);
  if (Object.keys(errors).length > 0) {
    await trackAnalyticsEvent({
      eventName: "contact_form_invalid_input",
      params: {
        hasName: Boolean(input.name),
        hasEmail: Boolean(input.email),
        hasService: Boolean(input.service),
        hasBudget: Boolean(input.budget),
        hasTimeline: Boolean(input.timeline),
        hasMessage: Boolean(input.message),
      },
      env: analyticsEnv(),
    });

    return NextResponse.json(
      { error: "Please review the highlighted fields.", fieldErrors: errors },
      { status: 400 },
    );
  }

  const fallbackEmail = getContactEmail();
  const notionConfigured = isNotionLeadsConfigured();
  const webhookConfigured = isContactWebhookConfigured();

  if (!notionConfigured && !webhookConfigured) {
    await trackAnalyticsEvent({
      eventName: "contact_form_delivery_unconfigured",
      params: {
        service: input.service,
      },
      env: analyticsEnv(),
    });

    return NextResponse.json(
      {
        error: `Direct form delivery is temporarily unavailable. Please email ${fallbackEmail} or book a strategy call above so we don't miss your request.`,
        deliveryConfigured: false,
      },
      { status: 503 },
    );
  }

  const fingerprint = computeSubmissionFingerprint({
    email: input.email,
    service: input.service,
    message: input.message,
  });

  if (!acquireSubmissionLock(fingerprint)) {
    return NextResponse.json(
      { ok: true, accepted: true, duplicate: true },
      { status: 200 },
    );
  }

  const submittedAt = new Date().toISOString();
  const source = input.attribution?.source ?? "website_contact_page";
  let durablyStored = false;

  try {
    // 1. Primary durable destination: direct Notion Leads database integration (when configured).
    if (notionConfigured) {
      try {
        await createNotionLead({
          ...input,
          submittedAt,
          source,
        });
        durablyStored = true;
      } catch (error) {
        await trackAnalyticsEvent({
          eventName: "contact_form_notion_failed",
          params: {
            message: error instanceof Error ? error.message.slice(0, 100) : "unknown_error",
          },
          env: analyticsEnv(),
        });
      }
    }

    // 2. Optional or secondary webhook destination (preserved for CRM/Slack/custom automations).
    if (webhookConfigured) {
      const webhookUrl = process.env.CONTACT_FORM_WEBHOOK_URL!.trim();
      const webhookSecret = process.env.CONTACT_FORM_WEBHOOK_SECRET?.trim();
      const payload = {
        name: input.name,
        email: input.email,
        company: input.company || undefined,
        service: input.service,
        budget: input.budget,
        timeline: input.timeline,
        message: input.message,
        submittedAt,
        source,
        attribution: input.attribution ?? {},
      };

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(webhookSecret
              ? { "x-contact-form-secret": webhookSecret }
              : {}),
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed with status ${response.status}`);
        }
        durablyStored = true;
      } catch (error) {
        await trackAnalyticsEvent({
          eventName: "contact_form_webhook_failed",
          params: {
            message: error instanceof Error ? error.message.slice(0, 100) : "unknown_error",
          },
          env: analyticsEnv(),
        });
      }
    }

    if (durablyStored) {
      recordAcceptedSubmission(fingerprint);
    }
  } finally {
    releaseSubmissionLock(fingerprint);
  }

  if (!durablyStored) {
    return NextResponse.json(
      {
        error: `We could not deliver your request right now. Please email ${fallbackEmail} directly or book a strategy call above.`,
      },
      { status: 502 },
    );
  }

  // Operational log strictly excludes PII (no name, email, company, or free-text message).
  console.info("[contact] lead stored", {
    service: input.service,
    budget: input.budget,
    timeline: input.timeline,
    source,
    submittedAt,
  });

  return NextResponse.json({ ok: true, accepted: true, duplicate: false }, { status: 200 });
}
