"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  isBrowserAnalyticsAllowed,
  isValidGaMeasurementId,
  sanitizeReferrer,
} from "@/lib/client-analytics";
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsentState,
} from "@/lib/consent";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

function subscribeConsent(callback: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function subscribeEmpty() {
  return () => {};
}

function setGaDisableFlag(measurementId: string, disabled: boolean) {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = disabled;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const isClient = useSyncExternalStore(
    subscribeEmpty,
    () => true,
    () => false,
  );
  const consent = useSyncExternalStore<AnalyticsConsentState>(
    subscribeConsent,
    getAnalyticsConsent,
    () => "unset",
  );
  const [showPreferences, setShowPreferences] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const lastTrackedPathRef = useRef<string | null>(null);

  const validId = isValidGaMeasurementId(measurementId) ? measurementId.trim() : null;
  const browserAllowed = isClient ? isBrowserAnalyticsAllowed() : false;

  useEffect(() => {
    const onOpen = () => setShowPreferences(true);
    const onChanged = () => setShowPreferences(false);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    window.addEventListener(CONSENT_CHANGED_EVENT, onChanged);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
      window.removeEventListener(CONSENT_CHANGED_EVENT, onChanged);
    };
  }, []);

  const canTrack = Boolean(validId && browserAllowed && consent === "granted");

  // Enforce immediate opt-out when consent is denied or withdrawn mid-session.
  useEffect(() => {
    if (!validId || !isClient) return;

    if (canTrack) {
      setGaDisableFlag(validId, false);
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
    } else {
      setGaDisableFlag(validId, true);
      lastTrackedPathRef.current = null;
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
    }
  }, [canTrack, isClient, validId]);

  useEffect(() => {
    if (!canTrack || !scriptLoaded) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    // Send clean pathname & query-stripped referrer so PII never reaches GA4.
    const cleanPath = pathname || "/";
    if (lastTrackedPathRef.current === cleanPath) return;

    lastTrackedPathRef.current = cleanPath;
    window.gtag("event", "page_view", {
      page_path: cleanPath,
      page_location: `${window.location.origin}${cleanPath}`,
      page_referrer: sanitizeReferrer(document.referrer),
      page_title: document.title,
    });
  }, [canTrack, pathname, scriptLoaded]);

  if (!validId || !isClient || !browserAllowed) {
    return null;
  }

  const shouldShowBanner = consent === "unset" || showPreferences;

  return (
    <>
      {canTrack ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(validId)}`}
            strategy="afterInteractive"
            onLoad={() => setScriptLoaded(true)}
          />
          <Script id="techbckp-ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              gtag('js', new Date());
              var cleanRef = '';
              try {
                if (document.referrer) {
                  var u = new URL(document.referrer);
                  if (u.protocol === 'https:' || u.protocol === 'http:') {
                    cleanRef = u.origin + u.pathname;
                  }
                }
              } catch (_) {}
              gtag('config', ${JSON.stringify(validId)}, {
                send_page_view: false,
                page_location: window.location.origin + window.location.pathname,
                page_referrer: cleanRef,
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            `}
          </Script>
        </>
      ) : null}

      {shouldShowBanner ? (
        <aside
          aria-label="Analytics consent preferences"
          className="fixed bottom-4 left-4 right-4 z-40 max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 sm:right-auto"
        >
          <p className="text-sm font-semibold text-on-background">Analytics &amp; Privacy</p>
          <p className="mt-1 text-xs leading-relaxed text-tertiary">
            We use privacy-focused Google Analytics to understand which guides and services help visitors most. No personal details are shared.{" "}
            <Link href="/privacy-policy" className="font-semibold text-on-background underline">
              Privacy Policy
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAnalyticsConsent("denied")}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-3.5 py-2 text-xs font-semibold text-on-background transition-colors hover:bg-surface-container"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => setAnalyticsConsent("granted")}
              className="rounded-lg bg-primary-container px-3.5 py-2 text-xs font-semibold text-on-primary-container transition-opacity hover:opacity-90"
            >
              Accept Analytics
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
