import type { Metadata } from "next";

import { AudienceCards } from "@/components/marketing/audience-cards";
import { BlogPreview } from "@/components/marketing/blog-preview";
import { CTASection } from "@/components/marketing/cta-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { PageShell } from "@/components/marketing/page-shell";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { ProcessSection } from "@/components/marketing/process-section";
import { QualificationSection } from "@/components/marketing/qualification-section";
import { ServicesBento } from "@/components/marketing/service-cards";
import { getSortedPosts } from "@/lib/blog";
import { buildPageMetadata, DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/seo";
import {
  audiences,
  pricingTiers,
  processSteps,
  qualification,
  services,
} from "@/lib/site-data";

export const metadata: Metadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  useAbsoluteTitle: true,
});

export default async function Home() {
  const posts = await getSortedPosts();

  return (
    <PageShell>
      <HeroSection />
      <ServicesBento services={services} />
      <AudienceCards audiences={audiences} />
      <ProcessSection steps={processSteps} />
      <QualificationSection qualification={qualification} />
      <PricingCards tiers={pricingTiers} headingAs="h2" />
      <BlogPreview posts={posts} />
      <CTASection />
    </PageShell>
  );
}
