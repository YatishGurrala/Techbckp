"use client";

import { FormEvent, useMemo, useState } from "react";

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

const INITIAL_VALUES: FormValues = {
  name: "",
  email: "",
  company: "",
  service: "",
  budget: "",
  timeline: "",
  message: "",
  website: "",
};

const SERVICE_OPTIONS = [
  "MVP development",
  "Automation and integrations",
  "Website redesign",
  "Content systems",
  "Technical advisory",
  "Other",
];

const BUDGET_OPTIONS = ["Under $2k", "$2k - $5k", "$5k - $10k", "$10k+", "Not sure yet"];

const TIMELINE_OPTIONS = ["ASAP", "2-4 weeks", "1-2 months", "3+ months", "Flexible"];

export function ContactIntakeForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const isDisabled = useMemo(
    () => isSubmitting || !values.name || !values.email || !values.message,
    [isSubmitting, values.email, values.message, values.name],
  );

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
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
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        setStatus("error");
        setStatusMessage(data.error ?? "We could not submit your form. Please try again.");
        return;
      }

      setValues(INITIAL_VALUES);
      setErrors({});
      setStatus("success");
      setStatusMessage("Thanks, your request is in. We will get back to you within one business day.");
    } catch {
      setStatus("error");
      setStatusMessage("Network error. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2" noValidate>
      <div>
        <label htmlFor="contact-name" className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant">
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
        <label htmlFor="contact-email" className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant">
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
        <label htmlFor="contact-company" className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant">
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
        <label htmlFor="contact-service" className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant">
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
        <label htmlFor="contact-budget" className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant">
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
        <label htmlFor="contact-timeline" className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant">
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
        {errors.timeline ? <p className="mt-1 text-label-sm text-error">{errors.timeline}</p> : null}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="contact-message" className="mb-1 block text-label-sm uppercase tracking-wide text-on-surface-variant">
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
        {errors.message ? <p className="mt-1 text-label-sm text-error">{errors.message}</p> : null}
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

      <div className="md:col-span-2 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
        <button
          type="submit"
          disabled={isDisabled}
          className="inline-flex min-w-[220px] justify-center rounded-lg bg-primary-container px-6 py-3 text-label-bold text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Send Request"}
        </button>
        <p className="text-label-sm text-tertiary">We usually reply within one business day.</p>
      </div>

      <div className="md:col-span-2" aria-live="polite">
        {status === "success" ? <p className="text-body-md text-primary">{statusMessage}</p> : null}
        {status === "error" ? <p className="text-body-md text-error">{statusMessage}</p> : null}
      </div>
    </form>
  );
}
