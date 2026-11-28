export type AnalyticsConsentState = "granted" | "denied" | "unset";

export const CONSENT_STORAGE_KEY = "techbckp_analytics_consent_v1";
export const CONSENT_CHANGED_EVENT = "techbckp:consent-changed";
export const CONSENT_OPEN_EVENT = "techbckp:consent-open";

export function getAnalyticsConsent(): AnalyticsConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === "granted" || raw === "denied") return raw;
    return "unset";
  } catch {
    return "unset";
  }
}

export function setAnalyticsConsent(state: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    // Ignore storage quota or private-browsing errors.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: state }));
}

export function openConsentPreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

