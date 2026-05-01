import { CTASection } from "@/components/marketing/cta-section";
import { PageShell } from "@/components/marketing/page-shell";
import { ProcessTimeline, SuccessMetrics, TechStack } from "@/components/marketing/process-timeline";
import { getProcessSteps } from "@/lib/cms";

export const revalidate = 300;

export default async function ProcessPage() {
  const steps = await getProcessSteps();

  return (
    <PageShell>
      <section className="page-wrap py-16 md:py-20">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-background md:text-6xl">The Techbckp Blueprint</h1>
        <p className="mt-4 max-w-3xl text-lg text-tertiary">
          A transparent, 3-step journey from initial concept to a scalable reality. We focus on execution-led
          strategies that turn complex problems into streamlined solutions.
        </p>
      </section>
      <ProcessTimeline steps={steps} />
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
