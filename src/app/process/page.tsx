import type { Metadata } from "next";

import { CTASection } from "@/components/marketing/cta-section";
import { PageShell } from "@/components/marketing/page-shell";
import { ProcessTimeline, SuccessMetrics, TechStack } from "@/components/marketing/process-timeline";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { processSteps } from "@/lib/site-data";

export const metadata: Metadata = buildPageMetadata({
  title: "Process",
  description:
    "See how Techbckp takes founders from idea to production launch in three structured steps using proven engineering systems.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Process", path: "/process" },
        ])}
      />
      <section className="page-wrap py-16 md:py-20">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-background md:text-6xl">The Techbckp Blueprint</h1>
        <p className="mt-4 max-w-3xl text-lg text-tertiary">
          A transparent, 3-step journey from initial concept to a scalable reality. We focus on execution-led
          strategies that turn complex problems into streamlined solutions.
        </p>
      </section>
      <ProcessTimeline steps={processSteps} />
      <TechStack />
      <SuccessMetrics />
      <CTASection
        title="Ready to start the blueprint?"
        body="Our transparent pricing model ensures you know exactly what you are paying for at every stage of the journey."
        primaryLabel="View Pricing"
        primaryHref="/pricing"
      />
    </PageShell>
  );
}
