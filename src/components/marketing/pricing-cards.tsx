import type { PricingTier } from "@/lib/cms";
import { externalLinks } from "@/lib/site-data";

type PricingCardsProps = {
  tiers: PricingTier[];
  title?: string;
  subtitle?: string;
};

const TIER_LABELS: Record<string, string> = {
  "MVP Launch System": "Startup",
  "Business Automation Setup": "Efficiency",
  "Conversion Website Setup": "Growth",
  "Content Growth System": "Authority",
};

function tierLabel(name: string) {
  return TIER_LABELS[name] ?? name;
}

const TYPICAL_RANGE: Record<string, string> = {
  "MVP Launch System": "Typical range: $2,000 - $10,000+",
  "Business Automation Setup": "Typical range: $500 - $3,000+",
  "Conversion Website Setup": "Typical range: $500 - $2,500+",
  "Content Growth System": "Typical range: $300 - $2,000+",
};

export function PricingCards({
  tiers,
  title = "Investment in Your Growth",
  subtitle = "Starting prices that scale with your ambition. No hidden fees. Just execution-focused packages tailored to your stage.",
}: PricingCardsProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8" id="pricing">
      <header className="py-section-gap mx-auto max-w-3xl text-center">
        <h1 className="text-headline-xl mb-stack-md text-on-background">{title}</h1>
        <p className="text-body-lg text-tertiary">{subtitle}</p>
      </header>

      <div className="mb-section-gap">
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const isFeatured = !!tier.featured;
            const label = tierLabel(tier.name);
            const range = TYPICAL_RANGE[tier.name];
            const ctaHref = tier.ctaHref && !tier.ctaHref.includes("test_placeholder") ? tier.ctaHref : "/contact";
            return (
              <div
                key={tier.name}
                className={
                  isFeatured
                    ? "group ambient-shadow relative z-10 flex md:scale-105 flex-col rounded-xl border-2 border-primary-container bg-surface-container-lowest p-stack-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    : "group ambient-shadow flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg transition-all duration-200 hover:-translate-y-1 hover:border-primary-container hover:shadow-lg"
                }
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-container px-4 py-1 text-xs font-semibold uppercase tracking-wider text-on-primary">
                    Most Popular
                  </div>
                )}

                <div className="mb-stack-lg">
                  <span
                    className={
                      isFeatured
                        ? "text-xs font-semibold uppercase tracking-widest text-primary"
                        : "text-xs font-semibold uppercase tracking-widest text-secondary"
                    }
                  >
                    {label}
                  </span>
                  <h3 className="text-headline-md mt-stack-sm">{tier.name}</h3>
                  <p className="mt-stack-sm text-tertiary">{tier.tagline}</p>
                </div>

                <div className="mb-stack-lg">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold uppercase text-tertiary">Starting at</span>
                  </div>
                  <span className={tier.price.length > 8 ? "text-2xl font-extrabold" : "text-headline-xl"}>
                    {tier.price}
                  </span>
                  {range ? <p className="mt-1 text-xs text-tertiary">{range}</p> : null}
                </div>

                <ul className="mb-stack-lg flex-grow space-y-stack-md">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }} aria-hidden>
                        check_circle
                      </span>
                      <span className="text-sm font-semibold">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={ctaHref}
                  className={
                    isFeatured
                      ? "rounded bg-primary-container px-6 py-4 text-center text-label-bold text-on-primary transition-colors group-hover:bg-orange-500"
                      : "rounded border border-on-background px-6 py-4 text-center text-label-bold text-on-background transition-colors group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white"
                  }
                >
                  {tier.ctaLabel}
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-lg border border-orange-100 bg-orange-50 p-4 md:flex-row">
          <div className="flex items-center gap-3 text-orange-800">
            <span className="material-symbols-outlined" aria-hidden>
              info
            </span>
            <p className="text-sm">
              All projects are custom-scoped to your specific needs. Let&apos;s discuss your requirements and create the perfect solution.
            </p>
          </div>
          <a
            href={externalLinks.calendly}
            className="whitespace-nowrap rounded-lg bg-primary px-6 py-2 text-label-bold text-white transition-colors hover:opacity-90"
          >
            Book a Call
          </a>
        </div>
      </div>
    </section>
  );
}

export function CustomSolutions() {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="relative mb-section-gap flex flex-col items-center justify-between gap-gutter overflow-hidden rounded-xl bg-inverse-surface p-stack-lg md:flex-row md:p-margin-page">
        <div className="z-10 flex-1">
          <h2 className="text-headline-lg mb-stack-md text-white">Custom Solutions</h2>
          <p className="max-w-xl text-body-lg text-zinc-300">
            Have a unique technical challenge that doesn&apos;t fit our standard tiers? Our experts can design a bespoke execution plan for legacy migrations, hardware integrations, or specialized AI workloads.
          </p>
          <div className="mt-stack-lg flex flex-wrap gap-stack-md">
            {["Legacy Migration", "AI Infrastructure", "Hardware Sync"].map((tag) => (
              <div
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div className="z-10 flex-shrink-0">
          <a
            href="/contact"
            className="rounded-lg bg-surface-container-lowest px-8 py-4 text-label-bold text-on-background transition-colors hover:bg-zinc-100"
          >
            Request Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "How long does 'The Setup' typically take?",
    a: "Our foundation projects are designed for speed. Typically, we deliver a fully hardened cloud infrastructure and CI/CD pipeline within 10-14 business days from the kickoff meeting.",
  },
  {
    q: "What kind of maintenance is included?",
    a: "All packages include 30 days of post-launch hyper-care. For long-term maintenance, we offer 'Scale Partner' retainers or standalone support blocks tailored to your uptime requirements.",
  },
  {
    q: "Can we upgrade our tier mid-project?",
    a: "Yes. We build with scalability in mind. If you find your requirements growing during the implementation phase, we can pivot to a higher tier and adjust the roadmap accordingly.",
  },
  {
    q: "Do you offer flexible payment terms?",
    a: "Standard terms are 50% upfront and 50% upon delivery. For 'Scale Partner' engagements, we can discuss milestone-based billing or quarterly installments to align with your capital flow.",
  },
];

export function PricingFAQ() {
  return (
    <section className="mx-auto mb-section-gap max-w-4xl px-6 lg:px-8">
      <div className="mb-stack-lg text-center">
        <h2 className="text-headline-lg">Common Questions</h2>
        <p className="mt-stack-sm text-tertiary">Everything you need to know about partnering with Techbckp.</p>
      </div>
      <div className="space-y-gutter">
        {FAQS.map((faq) => (
          <div key={faq.q} className="ambient-shadow rounded-lg bg-surface-container-lowest p-stack-lg outline-subtle">
            <h4 className="text-headline-md mb-stack-sm text-lg">{faq.q}</h4>
            <p className="text-tertiary">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
