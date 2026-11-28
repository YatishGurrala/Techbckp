import { getAnalyticsConsent } from "@/lib/consent";

export type ClientAnalyticsEventName =
  | "cta_click"
  | "email_click"
  | "booking_click"
  | "brief_copied";

export type AnalyticsEventValue = string | number | boolean | undefined;
export type ClientAnalyticsParams = Record<string, AnalyticsEventValue>;

// Strict allowlist of non-PII event & attribution parameters.
export const ALLOWED_ANALYTICS_KEYS = new Set([
  "location",
  "label",
  "service",
  "budget",
  "timeline",
  "source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
]);

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_PATTERN = /\+?\d[\d\s().-]{7,}\d/;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isValidGaMeasurementId(id: string | undefined | null): id is string {
  if (!id) return false;
  return /^G-[A-Z0-9]{6,20}$/i.test(id.trim());
}

export function isBrowserAnalyticsAllowed(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const nav = navigator as Navigator & {
    globalPrivacyControl?: boolean;
    msDoNotTrack?: string;
  };

  if (nav.globalPrivacyControl === true) return false;
  if (nav.doNotTrack === "1" || nav.msDoNotTrack === "1") return false;

  return true;
}

export function sanitizeAnalyticsParams(
  params?: ClientAnalyticsParams,
): Record<string, string | number | boolean> {
  if (!params) return {};

  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const normalizedKey = key.toLowerCase();
    if (!ALLOWED_ANALYTICS_KEYS.has(normalizedKey)) continue;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) continue;
      if (EMAIL_PATTERN.test(trimmed) || PHONE_PATTERN.test(trimmed)) continue;
      safe[normalizedKey] = trimmed.slice(0, 100);
    } else {
      safe[normalizedKey] = value;
    }
  }

  return safe;
}

export function sanitizeReferrer(referrer: string | undefined | null): string {
  const raw = String(referrer ?? "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    // Strip query parameters and fragments so referrers never carry PII or tokens.
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return "";
  }
}

export function trackClientEvent(
  eventName: ClientAnalyticsEventName,
  params?: ClientAnalyticsParams,
): void {
  if (!isBrowserAnalyticsAllowed()) return;
  if (getAnalyticsConsent() !== "granted") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, sanitizeAnalyticsParams(params));
}
