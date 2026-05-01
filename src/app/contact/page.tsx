import type { Metadata } from "next";

import { PageShell } from "@/components/marketing/page-shell";
import { externalLinks } from "@/lib/site-data";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@techbckp.com";
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`;

export const metadata: Metadata = {
  title: "Contact | Techbckp",
  description: "Start a project, ask a question, or book a strategy call with Techbckp.",
};

const OPTIONS = [
  {
    icon: "calendar_today",
    title: "Book a Strategy Call",
    body: "30-minute call to discuss your project, timeline, and budget. No fluff, just clarity.",
    cta: "Schedule a Call",
    href: externalLinks.calendly,
    accent: true,
  },
  {
    icon: "mail",
    title: "Send an Email",
    body: "Prefer async? Drop us a line and we'll respond within one business day.",
    cta: CONTACT_EMAIL,
    href: GMAIL_COMPOSE_URL,
    accent: false,
  },
];

export default function ContactPage() {
  return (
    <PageShell>
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
          {OPTIONS.map((opt) => (
            <div
              key={opt.title}
              className={
                opt.accent
                  ? "ambient-shadow flex flex-col rounded-xl border-2 border-primary-container bg-surface-container-lowest p-stack-lg"
                  : "ambient-shadow flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg"
              }
            >
              <span className="material-symbols-outlined filled mb-stack-md text-primary-container text-[2rem]" aria-hidden>
                {opt.icon}
              </span>
              <h3 className="text-headline-md mb-stack-sm text-on-background">{opt.title}</h3>
              <p className="mb-stack-lg flex-1 text-body-md text-tertiary">{opt.body}</p>
              <a
                href={opt.href}
                target={opt.title === "Send an Email" ? "_blank" : undefined}
                rel={opt.title === "Send an Email" ? "noreferrer" : undefined}
                className={
                  opt.accent
                    ? "inline-flex justify-center rounded-lg bg-primary-container px-6 py-3 text-label-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
                    : "inline-flex justify-center rounded-lg border border-on-background px-6 py-3 text-label-bold text-on-background transition-all hover:bg-surface-container active:scale-95"
                }
              >
                {opt.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ strip */}
        <div className="mt-16 rounded-xl border border-outline-variant bg-surface-container-low p-gutter">
          <h3 className="text-headline-md mb-stack-lg text-on-background">Before you reach out</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
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
            ].map((item) => (
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
