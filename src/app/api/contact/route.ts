import { NextResponse, type NextRequest } from "next/server";

import { trackAnalyticsEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

type ContactBody = {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  website?: string;
};

function analyticsEnv() {
  return {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    apiSecret: process.env.GA_API_SECRET,
  };
}

function cleanValue(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

function parseBody(raw: Record<string, unknown>): ContactBody {
  return {
    name: cleanValue(raw.name),
    email: cleanValue(raw.email),
    company: cleanValue(raw.company),
    service: cleanValue(raw.service),
    budget: cleanValue(raw.budget),
    timeline: cleanValue(raw.timeline),
    message: cleanValue(raw.message),
    website: cleanValue(raw.website),
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(input: ContactBody) {
  const errors: Partial<Record<keyof ContactBody, string>> = {};

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
  let raw: Record<string, unknown>;

  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseBody(raw);

  // Honeypot field: likely bot traffic if filled.
  if (input.website) {
    return NextResponse.json({ ok: true }, { status: 200 });
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

  const submittedAt = new Date().toISOString();
  const payload = {
    ...input,
    submittedAt,
    source: "website_contact_page",
  };

  const webhookUrl = process.env.CONTACT_FORM_WEBHOOK_URL?.trim();
  const webhookSecret = process.env.CONTACT_FORM_WEBHOOK_SECRET?.trim();

  if (webhookUrl) {
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
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }
    } catch (error) {
      await trackAnalyticsEvent({
        eventName: "contact_form_webhook_failed",
        params: {
          message: error instanceof Error ? error.message : "unknown_error",
        },
        env: analyticsEnv(),
      });

      return NextResponse.json(
        { error: "We could not submit your request right now. Please email us directly." },
        { status: 502 },
      );
    }
  }

  console.info("[contact] new lead", {
    name: input.name,
    email: input.email,
    service: input.service,
    budget: input.budget,
    timeline: input.timeline,
    submittedAt,
  });

  await trackAnalyticsEvent({
    eventName: "contact_form_submitted",
    params: {
      service: input.service,
      budget: input.budget,
      timeline: input.timeline,
      hasCompany: Boolean(input.company),
    },
    env: analyticsEnv(),
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
