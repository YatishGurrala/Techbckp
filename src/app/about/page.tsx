import type { Metadata } from "next";
import Link from "next/link";

import { CTASection } from "@/components/marketing/cta-section";
import { PageShell } from "@/components/marketing/page-shell";
import { externalLinks } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About | Techbckp",
  description: "We're an execution-first tech partner for founders, coaches, and niche businesses. No fluff — just systems that ship.",
};

const VALUES = [
  {
    icon: "bolt",
    title: "Ship First, Optimize Later",
    body: "We believe a working product in the market beats a perfect product on a whiteboard. Speed is a feature.",
  },
  {
    icon: "inventory_2",
    title: "Systems Over Heroics",
    body: "We don't rely on individual brilliance. We build repeatable, documented systems your team can own and operate.",
  },
  {
    icon: "groups",
    title: "Founders as Partners",
    body: "We work alongside you, not above you. You stay in the loop on every decision that affects your business.",
  },
  {
    icon: "trending_up",
    title: "Execution is the Differentiator",
    body: "The best strategy means nothing without execution. We measure ourselves by outcomes, not outputs.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="page-wrap py-16 md:py-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-container">Our Story</p>
        <h1 className="text-headline-xl max-w-3xl text-on-background">
          The execution partner we wished we had.
        </h1>
        <p className="mt-6 max-w-2xl text-body-lg text-tertiary">
          Techbckp was built out of frustration. Too many great ideas died not because they were bad — but because the
          founders couldn&apos;t find technical partners who moved fast, communicated clearly, and actually cared about
          the outcome.
        </p>
        <p className="mt-4 max-w-2xl text-body-lg text-tertiary">
          We&apos;re a small, senior team of builders who&apos;ve launched apps, automations, and content systems for
          founders across fintech, health, coaching, and e-commerce. We don&apos;t consult. We execute.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={externalLinks.calendly}
            className="rounded-lg bg-primary-container px-8 py-4 text-label-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
          >
            Book a Strategy Call
          </a>
          <Link
            href="/services"
            className="rounded-lg border border-on-background bg-surface-container-lowest px-8 py-4 text-label-bold text-on-background transition-all hover:bg-surface-container"
          >
            See Our Services
          </Link>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-container-low py-section-gap">
        <div className="page-wrap">
          <div className="mb-12 text-center">
            <h2 className="text-headline-lg text-on-background">How We Work</h2>
            <p className="mt-3 text-tertiary">The principles that guide every engagement.</p>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="ambient-shadow rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                <span className="material-symbols-outlined filled mb-stack-sm text-primary-container" aria-hidden>
                  {v.icon}
                </span>
                <h3 className="text-headline-md mb-stack-sm text-on-background">{v.title}</h3>
                <p className="text-body-md text-tertiary">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to execute your next idea?"
        body="Let's talk about what you're building and how fast we can ship it."
        primaryLabel="Start a Project"
        primaryHref="/contact"
        secondaryLabel="See Pricing"
        secondaryHref="/pricing"
      />
    </PageShell>
  );
}
