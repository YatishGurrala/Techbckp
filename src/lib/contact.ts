import { isNotionLeadsConfigured } from "@/lib/notion-leads";

export const SERVICE_OPTIONS = [
  "MVP development",
  "Mobile app development",
  "SaaS development",
  "AI automation and integrations",
  "AI chatbot development",
  "Website development",
  "Content systems",
  "Technical advisory",
  "Other",
] as const;

export const BUDGET_OPTIONS = [
  "Under $2k",
  "$2k - $5k",
  "$5k - $10k",
  "$10k+",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = [
  "ASAP",
  "2-4 weeks",
  "1-2 months",
  "3+ months",
  "Flexible",
] as const;

const SERVICE_SLUG_MAP: Record<string, (typeof SERVICE_OPTIONS)[number]> = {
  "mvp": "MVP development",
  "mvp-development": "MVP development",
  "mvp-launch-system": "MVP development",
  "mobile": "Mobile app development",
  "mobile-app-development": "Mobile app development",
  "saas": "SaaS development",
  "saas-development": "SaaS development",
  "automation": "AI automation and integrations",
  "ai-automation": "AI automation and integrations",
  "business-automation-setup": "AI automation and integrations",
  "chatbot": "AI chatbot development",
  "ai-chatbot-development": "AI chatbot development",
  "web": "Website development",
  "web-development": "Website development",
  "conversion-website-setup": "Website development",
  "content": "Content systems",
  "content-systems": "Content systems",
  "content-growth-system": "Content systems",
  "advisory": "Technical advisory",
  "technical-advisory": "Technical advisory",
};

export function normalizeServiceSelection(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const exact = SERVICE_OPTIONS.find(
    (option) => option.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) return exact;

  const slugKey = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return SERVICE_SLUG_MAP[slugKey] ?? "";
}

export function normalizeOptionSelection<T extends readonly string[]>(
  raw: string | null | undefined,
  options: T,
): string {
  if (!raw) return "";
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return "";
  return options.find((opt) => opt.toLowerCase() === trimmed) ?? "";
}

export function isValidWebhookUrl(raw: string | undefined | null): boolean {
  const value = String(raw ?? "").trim();
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function isContactWebhookConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isValidWebhookUrl(env.CONTACT_FORM_WEBHOOK_URL);
}

export function isContactDeliveryConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isNotionLeadsConfigured(env) || isContactWebhookConfigured(env);
}

export type ContactAttribution = {
  source?: string;
  referrerPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  toolSummary?: string;
};

export type ContactSubmissionInput = {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  website?: string;
  attribution?: ContactAttribution;
};

