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
import {
  getAudiences,
  getPage,
  getPricing,
  getProcessSteps,
  getQualification,
  getServices,
} from "@/lib/cms";

export const revalidate = 300;

export default async function Home() {
  const [posts, services, audiences, processSteps, qualification, pricing, heroPage] =
    await Promise.all([
      getSortedPosts(),
      getServices(),
      getAudiences(),
      getProcessSteps(),
      getQualification(),
      getPricing(),
      getPage("hero"),
    ]);

  return (
    <PageShell>
      <HeroSection html={heroPage?.contentHtml ?? null} />
      <ServicesBento services={services} />
      <AudienceCards audiences={audiences} />
      <ProcessSection steps={processSteps} />
      <QualificationSection qualification={qualification} />
      <PricingCards tiers={pricing} />
      <BlogPreview posts={posts} />
      <CTASection />
    </PageShell>
  );
}
