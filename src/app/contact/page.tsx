import type { Metadata } from "next";
import { Suspense } from "react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { ContactIntakeForm } from "@/components/marketing/contact-intake-form";
import { PageShell } from "@/components/marketing/page-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { isContactDeliveryConfigured } from "@/lib/contact";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
  getContactEmail,
} from "@/lib/seo";
import { externalLinks } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description: "Start a project, submit a brief, or book a 30-minute strategy call with Techbckp.",
  path: "/contact",
});

const CONTACT_FAQS = [
  {
    q: "What industries do you work with?",
    a: "Founders, coaches, SaaS builders, niche e-commerce brands, and local services that need to scale digitally.",
  },
  {
    q: "How quickly can you start?",
    a: "Most projects kick off within a week of signing. We keep capacity for fast-moving founders.",
  },
  {
    q: "Do you take equity?",
    a: "We are primarily a service business. We work for fixed fees, not equity — so our incentives are always aligned with delivery.",
  },
  {
    q: "What if I'm not sure what I need?",
    a: "Book a strategy call. We'll scope the right solution together — no sales pressure, just honest advice.",
  },
];

export default function ContactPage() {
  const contactEmail = getContactEmail();
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}`;
  const isDeliveryConfigured = isContactDeliveryConfigured();

  const options = [
    {
      icon: "calendar_today",
      title: "Book a Strategy Call",
      body: "30-minute call to discuss your project, timeline, and budget. No fluff, just clarity.",
      cta: "Schedule a Call",
      href: externalLinks.calendly,
      eventName: "booking_click" as const,
      accent: true,
    },
    {
      icon: "mail",
      title: "Send an Email",
      body: "Prefer async? Drop us a line and we'll respond within one business day.",
      cta: contactEmail,
      href: gmailComposeUrl,
      eventName: "email_click" as const,
      accent: false,
    },
  ];

  return (
    <PageShell>
      <JsonLd data={buildFaqJsonLd(CONTACT_FAQS)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <section className="page-wrap py-16 md:py-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-container">Get in Touch</p>
        <h1 className="text-headline-xl max-w-2xl text-on-background">
          Let&apos;s build something together.
        </h1>
        <p className="mt-4 max-w-xl text-body-lg text-tertiary">
          Whether you have a clear brief or just an idea — we&apos;ll help you figure out the fastest path to launch.
        </p>
      </section>

      <section className="page-wrap pb-section-gap">
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          {options.map((opt) => (
            <div
              key={opt.title}
              className={
                opt.accent
                  ? "ambient-shadow flex flex-col rounded-xl border-2 border-primary-container bg-surface-container-lowest p-stack-lg"
                  : "ambient-shadow flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg"
              }
            >
              <span className="material-symbols-outlined filled mb-stack-md text-[2rem] text-primary-container" aria-hidden>
                {opt.icon}
              </span>
              <h2 className="text-headline-md mb-stack-sm text-on-background">{opt.title}</h2>
              <p className="mb-stack-lg flex-1 text-body-md text-tertiary">{opt.body}</p>
              <TrackedLink
                href={opt.href}
                external
                target="_blank"
                rel="noreferrer"
                eventName={opt.eventName}
                eventParams={{ location: "contact_cards" }}
                className={
                  opt.accent
                    ? "inline-flex justify-center rounded-lg bg-primary-container px-6 py-3 text-label-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
                    : "inline-flex justify-center rounded-lg border border-on-background px-6 py-3 text-label-bold text-on-background transition-all hover:bg-surface-container active:scale-95"
                }
              >
                {opt.cta}
              </TrackedLink>
            </div>
          ))}
        </div>

        <div className="ambient-shadow mt-16 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8">
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-container">
              Project Inquiry
            </p>
            <h2 className="text-headline-md text-on-background">Tell us about your project</h2>
            <p className="mt-2 text-body-md text-tertiary">
              Share your goals, scope, and timeline. We&apos;ll review your brief and follow up with clear next steps.
            </p>
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-surface-container-low" />}>
            <ContactIntakeForm
              fallbackEmail={contactEmail}
              calendlyUrl={externalLinks.calendly}
              isDeliveryConfigured={isDeliveryConfigured}
            />
          </Suspense>
        </div>

        {/* FAQ strip */}
        <div className="mt-16 rounded-xl border border-outline-variant bg-surface-container-low p-gutter">
          <h2 className="text-headline-md mb-stack-lg text-on-background">Before you reach out</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {CONTACT_FAQS.map((item) => (
              <div key={item.q}>
                <p className="mb-1 font-semibold text-on-background">{item.q}</p>
                <p className="text-body-md text-tertiary">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
