import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/cta-section";
import { PageShell } from "@/components/marketing/page-shell";
import {
  CustomSolutions,
  PRICING_FAQS,
  PricingCards,
  PricingFAQ,
} from "@/components/marketing/pricing-cards";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";
import { pricingTiers } from "@/lib/site-data";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing",
  description:
    "Transparent starting prices for MVP launches, business workflow automation, conversion websites, and content growth systems.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <PageShell>
      <JsonLd data={buildFaqJsonLd(PRICING_FAQS)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <PricingCards
        tiers={pricingTiers}
        headingAs="h1"
        title="Transparent Investment"
        subtitle="Starting prices that scale with your ambition. Final investment depends on scope, complexity, and specific requirements."
      />
      <CustomSolutions />
      <PricingFAQ />
      <CTASection
        title="Ready to build something robust?"
        body="Stop worrying about infrastructure and focus on your product while our team handles implementation."
        primaryLabel="Start Your Project"
        primaryHref="/contact"
        secondaryLabel="Schedule a Demo"
        secondaryHref="/contact"
      />
    </PageShell>
  );
}
