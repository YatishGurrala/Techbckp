"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { trackClientEvent } from "@/lib/client-analytics";
import {
  BUDGET_OPTIONS,
  buildPrefilledGmailUrl,
  buildPrefilledMailto,
  buildProjectBriefText,
  normalizeOptionSelection,
  normalizeServiceSelection,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/contact";

type ProjectBriefBuilderProps = {
  contactEmail: string;
  calendlyUrl: string;
};

type BriefFormState = {
  name: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  estimate: string;
  details: string;
};

export function ProjectBriefBuilder({
  contactEmail,
  calendlyUrl,
}: ProjectBriefBuilderProps) {
  const searchParams = useSearchParams();

  const initialPrefill = useMemo(() => {
    // Only non-PII service/scope/campaign query params are read for pre-fill.
    // Customer names, emails, phone numbers, and confidential descriptions are never read from URLs.
    const service = normalizeServiceSelection(searchParams.get("service"));
    const budget = normalizeOptionSelection(searchParams.get("budget"), BUDGET_OPTIONS);
    const timeline = normalizeOptionSelection(searchParams.get("timeline"), TIMELINE_OPTIONS);
    const estimateRaw = searchParams.get("estimate")?.trim() ?? "";
    const safeEstimate =
      estimateRaw && !/@/.test(estimateRaw) ? estimateRaw.slice(0, 80) : "";

    const attribution = {
      source:
        searchParams.get("source")?.trim() ||
        searchParams.get("ref")?.trim() ||
        "website_contact_page",
      utm_source: searchParams.get("utm_source")?.trim() || undefined,
      utm_medium: searchParams.get("utm_medium")?.trim() || undefined,
      utm_campaign: searchParams.get("utm_campaign")?.trim() || undefined,
    };

    const draft: BriefFormState = {
      name: "",
      company: "",
      service,
      budget,
      timeline,
      estimate: safeEstimate,
      details: "",
    };

    return { draft, attribution };
  }, [searchParams]);

  const [values, setValues] = useState<BriefFormState>(() => initialPrefill.draft);
  const [feedback, setFeedback] = useState<string>("");

  function updateField<K extends keyof BriefFormState>(key: K, value: BriefFormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (feedback) setFeedback("");
  }

  const analyticsMeta = {
    location: "project_brief_builder",
    service: values.service || undefined,
    budget: values.budget || undefined,
    timeline: values.timeline || undefined,
    source: initialPrefill.attribution.source,
    utm_source: initialPrefill.attribution.utm_source,
    utm_medium: initialPrefill.attribution.utm_medium,
    utm_campaign: initialPrefill.attribution.utm_campaign,
  };

  const mailtoHref = useMemo(
    () => buildPrefilledMailto(contactEmail, values),
    [contactEmail, values],
  );
  const gmailHref = useMemo(
    () => buildPrefilledGmailUrl(contactEmail, values),
    [contactEmail, values],
  );
  const briefPreview = useMemo(() => buildProjectBriefText(values), [values]);

  async function handleCopyBrief() {
    try {
      await navigator.clipboard.writeText(briefPreview);
      setFeedback("Project brief copied to your clipboard. Paste it into an email or Calendly notes.");
    } catch {
      setFeedback("Copy unavailable in this browser. You can copy the text directly or use Email Your Project Brief.");
    }
    trackClientEvent("brief_copied", analyticsMeta);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="brief-name"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Your name
          </label>
          <input
            id="brief-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
            placeholder="Jane Founder"
          />
        </div>

        <div>
          <label
            htmlFor="brief-company"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Company / brand (optional)
          </label>
          <input
            id="brief-company"
            name="company"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => updateField("company", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
            placeholder="Your business name"
          />
        </div>

        <div>
          <label
            htmlFor="brief-service"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Service needed
          </label>
          <select
            id="brief-service"
            name="service"
            value={values.service}
            onChange={(e) => updateField("service", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
          >
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="brief-budget"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Budget range
          </label>
          <select
            id="brief-budget"
            name="budget"
            value={values.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
          >
            <option value="">Select budget</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="brief-timeline"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Preferred timeline
          </label>
          <select
            id="brief-timeline"
            name="timeline"
            value={values.timeline}
            onChange={(e) => updateField("timeline", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
          >
            <option value="">Select timeline</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {values.estimate ? (
          <div>
            <label
              htmlFor="brief-estimate"
              className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
            >
              Estimated scope
            </label>
            <input
              id="brief-estimate"
              name="estimate"
              value={values.estimate}
              onChange={(e) => updateField("estimate", e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
            />
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label
            htmlFor="brief-details"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            What are you trying to build or automate?
          </label>
          <textarea
            id="brief-details"
            name="details"
            rows={5}
            value={values.details}
            onChange={(e) => updateField("details", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
            placeholder="Share your goals, key features, current blockers, and what success looks like."
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={mailtoHref}
          onClick={() => {
            trackClientEvent("email_click", { ...analyticsMeta, label: "mailto_brief" });
            setFeedback(
              `Opening your email app addressed to ${contactEmail}. Send the email from your app to complete your inquiry, or use Open in Gmail / Copy Project Brief.`,
            );
          }}
          className="inline-flex items-center justify-center rounded-lg bg-primary-container px-6 py-3 text-label-bold text-on-primary-container shadow transition-all hover:opacity-90 active:scale-95"
        >
          Email Your Project Brief
        </a>

        <a
          href={gmailHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            trackClientEvent("email_click", { ...analyticsMeta, label: "gmail_brief" });
            setFeedback(
              `Opened Gmail compose addressed to ${contactEmail}. Send the draft in Gmail to complete your inquiry.`,
            );
          }}
          className="inline-flex items-center justify-center rounded-lg border border-on-background bg-surface-container-lowest px-5 py-3 text-label-bold text-on-background transition-colors hover:bg-surface-container"
        >
          Open in Gmail
        </a>

        <button
          type="button"
          onClick={handleCopyBrief}
          className="inline-flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low px-5 py-3 text-label-bold text-on-background transition-colors hover:bg-surface-container"
        >
          Copy Project Brief
        </button>

        <a
          href={calendlyUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackClientEvent("booking_click", analyticsMeta)}
          className="inline-flex items-center justify-center rounded-lg border border-primary-container px-5 py-3 text-label-bold text-primary transition-colors hover:bg-primary-fixed/40 dark:text-primary-fixed"
        >
          Book a Strategy Call
        </a>
      </div>

      <p className="text-label-sm text-tertiary">
        Everything stays in your browser until you send your email to{" "}
        <a
          href={`mailto:${contactEmail}`}
          onClick={() => trackClientEvent("email_click", { location: "brief_direct_email" })}
          className="font-semibold text-on-background underline"
        >
          {contactEmail}
        </a>{" "}
        or book a call. We typically reply within one business day.
      </p>

      <div aria-live="polite">
        {feedback ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm text-on-background">
            {feedback}
          </p>
        ) : null}
      </div>
    </div>
  );
}

