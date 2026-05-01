import { CTASection } from "@/components/marketing/cta-section";
import { PageShell } from "@/components/marketing/page-shell";
import { CustomSolutions, PricingCards, PricingFAQ } from "@/components/marketing/pricing-cards";
import { getPage, getPricing } from "@/lib/cms";

export const revalidate = 300;

export default async function PricingPage() {
  const [tiers, cta] = await Promise.all([getPricing(), getPage("cta")]);

  return (
    <PageShell>
      <PricingCards
        tiers={tiers}
        title="Transparent Investment"
        subtitle="Starting prices that scale with your ambition.Final investment depends on scope, complexity, and specific requirements."
      />
      <CustomSolutions />
      <PricingFAQ />
      <CTASection
        html={cta?.contentHtml ?? null}
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
