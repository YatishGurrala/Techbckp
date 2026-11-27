"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";

import { trackClientEvent } from "@/lib/client-analytics";
import {
  BUDGET_OPTIONS,
  normalizeOptionSelection,
  normalizeServiceSelection,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
  type ContactAttribution,
} from "@/lib/contact";

type FormValues = {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  website: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

type ContactIntakeFormProps = {
  fallbackEmail: string;
  calendlyUrl: string;
  isDeliveryConfigured: boolean;
};

const EMPTY_VALUES: FormValues = {
  name: "",
  email: "",
  company: "",
  service: "",
  budget: "",
  timeline: "",
  message: "",
  website: "",
};

function buildFallbackMailto(email: string, values: FormValues): string {
  const subject = values.service
    ? `Project inquiry: ${values.service}`
    : "Project inquiry for Techbckp";
  const lines = [
    values.service ? `Service: ${values.service}` : null,
    values.budget ? `Budget: ${values.budget}` : null,
    values.timeline ? `Timeline: ${values.timeline}` : null,
    values.company ? `Company: ${values.company}` : null,
    values.message ? `\nProject details:\n${values.message}` : null,
  ].filter(Boolean);

  const params = new URLSearchParams({
    subject,
    ...(lines.length > 0 ? { body: lines.join("\n") } : {}),
  });

  return `mailto:${email}?${params.toString()}`;
}

export function ContactIntakeForm({
  fallbackEmail,
  calendlyUrl,
  isDeliveryConfigured,
}: ContactIntakeFormProps) {
  const searchParams = useSearchParams();

  const initialPrefill = useMemo(() => {
    const prefilledService = normalizeServiceSelection(searchParams.get("service"));
    const prefilledBudget = normalizeOptionSelection(
      searchParams.get("budget"),
      BUDGET_OPTIONS,
    );
    const prefilledTimeline = normalizeOptionSelection(
      searchParams.get("timeline"),
      TIMELINE_OPTIONS,
    );
    const summaryParam =
      searchParams.get("summary") ?? searchParams.get("message") ?? "";
    const estimateParam = searchParams.get("estimate") ?? "";
    const combinedMessage = [
      estimateParam ? `Estimated scope: ${estimateParam.trim()}` : "",
      summaryParam.trim(),
    ]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 3000);

    const attribution: ContactAttribution = {
      source:
        searchParams.get("source")?.trim() ||
        searchParams.get("ref")?.trim() ||
        "website_contact_page",
      referrerPath: searchParams.get("from")?.trim() || undefined,
      utmSource: searchParams.get("utm_source")?.trim() || undefined,
      utmMedium: searchParams.get("utm_medium")?.trim() || undefined,
      utmCampaign: searchParams.get("utm_campaign")?.trim() || undefined,
      utmContent: searchParams.get("utm_content")?.trim() || undefined,
      utmTerm: searchParams.get("utm_term")?.trim() || undefined,
      toolSummary:
        searchParams.get("tool")?.trim() || estimateParam.trim() || undefined,
    };

    const initialValues: FormValues = {
      ...EMPTY_VALUES,
      service: prefilledService,
      budget: prefilledBudget,
      timeline: prefilledTimeline,
      message: combinedMessage,
    };

    return { initialValues, attribution };
  }, [searchParams]);

  const [values, setValues] = useState<FormValues>(() => initialPrefill.initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const hasTrackedStartRef = useRef(false);

  const isDisabled = useMemo(
    () =>
      isSubmitting ||
      !values.name.trim() ||
      !values.email.trim() ||
      !values.message.trim(),
    [isSubmitting, values.email, values.message, values.name],
  );

  function markFormStarted() {
    if (hasTrackedStartRef.current) return;
    hasTrackedStartRef.current = true;
    trackClientEvent("contact_form_started", {
      service: values.service || undefined,
      source: initialPrefill.attribution.source,
      utm_source: initialPrefill.attribution.utmSource,
      utm_medium: initialPrefill.attribution.utmMedium,
      utm_campaign: initialPrefill.attribution.utmCampaign,
    });
  }

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    markFormStarted();
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus("idle");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          attribution: initialPrefill.attribution,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        accepted?: boolean;
        duplicate?: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!response.ok || !data.ok) {
        setErrors(data.fieldErrors ?? {});
        setStatus("error");
        setStatusMessage(
          data.error ?? "We could not submit your form. Please try again or email us directly.",
        );
        return;
      }

      if (data.accepted === true && !data.duplicate) {
        trackClientEvent("generate_lead", {
          service: values.service,
          budget: values.budget,
          timeline: values.timeline,
          source: initialPrefill.attribution.source,
          utm_source: initialPrefill.attribution.utmSource,
          utm_medium: initialPrefill.attribution.utmMedium,
          utm_campaign: initialPrefill.attribution.utmCampaign,
        });
      }

      setValues(EMPTY_VALUES);
      setErrors({});
      setStatus("success");
      setStatusMessage(
        "Thanks, your request has been received. We will reply within one business day.",
      );
    } catch {
      setStatus("error");
      setStatusMessage(
        `Network error. Please try again or email ${fallbackEmail} directly.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const fallbackMailtoHref = buildFallbackMailto(fallbackEmail, values);

  return (
    <div className="space-y-6">
      {!isDeliveryConfigured ? (
        <div
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <p className="font-semibold">Direct form delivery is being connected.</p>
          <p className="mt-1">
            To make sure your inquiry reaches us immediately, please{" "}
            <a
              href={fallbackMailtoHref}
              onClick={() => trackClientEvent("email_click", { location: "contact_form_notice" })}
              className="font-semibold underline"
            >
              email {fallbackEmail}
            </a>{" "}
            or{" "}
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackClientEvent("booking_click", { location: "contact_form_notice" })}
              className="font-semibold underline"
            >
              book a 30-minute strategy call
            </a>
            .
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2" noValidate>
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Full name *
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => updateValue("name", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
            placeholder="Jane Founder"
          />
          {errors.name ? <p className="mt-1 text-label-sm text-error">{errors.name}</p> : null}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Email *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => updateValue("email", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
            placeholder="jane@company.com"
          />
          {errors.email ? <p className="mt-1 text-label-sm text-error">{errors.email}</p> : null}
        </div>

        <div>
          <label
            htmlFor="contact-company"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Company
          </label>
          <input
            id="contact-company"
            name="company"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => updateValue("company", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
            placeholder="Your business name"
          />
          {errors.company ? <p className="mt-1 text-label-sm text-error">{errors.company}</p> : null}
        </div>

        <div>
          <label
            htmlFor="contact-service"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Service needed *
          </label>
          <select
            id="contact-service"
            name="service"
            value={values.service}
            onChange={(e) => updateValue("service", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
          >
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.service ? <p className="mt-1 text-label-sm text-error">{errors.service}</p> : null}
        </div>

        <div>
          <label
            htmlFor="contact-budget"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Budget range *
          </label>
          <select
            id="contact-budget"
            name="budget"
            value={values.budget}
            onChange={(e) => updateValue("budget", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
          >
            <option value="">Select budget</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.budget ? <p className="mt-1 text-label-sm text-error">{errors.budget}</p> : null}
        </div>

        <div>
          <label
            htmlFor="contact-timeline"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            Preferred timeline *
          </label>
          <select
            id="contact-timeline"
            name="timeline"
            value={values.timeline}
            onChange={(e) => updateValue("timeline", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
          >
            <option value="">Select timeline</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.timeline ? (
            <p className="mt-1 text-label-sm text-error">{errors.timeline}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="contact-message"
            className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant"
          >
            What are you trying to build? *
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            value={values.message}
            onChange={(e) => updateValue("message", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-background outline-none transition-colors focus:border-primary-container"
            placeholder="Tell us your goals, current blockers, and what success looks like for this project."
          />
          <p className="mt-1 text-label-sm text-tertiary">Minimum 20 characters.</p>
          {errors.message ? (
            <p className="mt-1 text-label-sm text-error">{errors.message}</p>
          ) : null}
        </div>

        <div className="hidden" aria-hidden>
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            value={values.website}
            onChange={(e) => updateValue("website", e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col items-start gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex min-w-[220px] justify-center rounded-lg bg-primary-container px-6 py-3 text-label-bold text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Send Project Inquiry"}
          </button>
          <p className="text-label-sm text-tertiary">
            We usually reply within one business day. Prefer email?{" "}
            <a
              href={fallbackMailtoHref}
              onClick={() => trackClientEvent("email_click", { location: "contact_form_footer" })}
              className="font-semibold text-on-background underline"
            >
              {fallbackEmail}
            </a>
          </p>
        </div>

        <div className="md:col-span-2" aria-live="polite">
          {status === "success" ? (
            <p className="rounded-lg border border-green-300 bg-green-50 p-4 text-body-md text-green-900 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
              {statusMessage}
            </p>
          ) : null}
          {status === "error" ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-body-md text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              <p>{statusMessage}</p>
              <p className="mt-2 text-sm">
                Fallback:{" "}
                <a
                  href={fallbackMailtoHref}
                  onClick={() => trackClientEvent("email_click", { location: "contact_form_error" })}
                  className="font-semibold underline"
                >
                  Send via email with your draft pre-filled
                </a>{" "}
                or{" "}
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackClientEvent("booking_click", { location: "contact_form_error" })}
                  className="font-semibold underline"
                >
                  book a call
                </a>
                .
              </p>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
