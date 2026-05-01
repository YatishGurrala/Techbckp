import type { Metadata } from "next";
import Image from "next/image";

import { CTASection } from "@/components/marketing/cta-section";
import { PageShell } from "@/components/marketing/page-shell";
import { ServiceCards } from "@/components/marketing/service-cards";
import { getServices } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Services | Techbckp",
  description: "Execution-focused systems for apps, automation, websites, and content. Built for founders and niche businesses.",
};

export const revalidate = 300;

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <PageShell>
      <section className="page-wrap py-16 md:py-20">
        <h1 className="text-headline-xl max-w-3xl text-on-background">Our Execution Systems</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-tertiary">
          Specialized frameworks designed to launch and scale your digital presence with engineering precision and
          surgical speed.
        </p>
      </section>
      <ServiceCards services={services} />

      <section className="page-wrap pb-section-gap">
        <div className="grid grid-cols-1 gap-gutter rounded-xl border border-outline-variant bg-surface-container-low p-gutter md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-headline-lg mb-stack-sm text-on-background">Why our systems work</h2>
            <p className="mb-stack-lg max-w-2xl text-body-md text-tertiary">
              We do not just build websites; we engineer revenue-generating engines using a battle-tested tech stack
              that prioritizes reliability and scalability above all else.
            </p>
            <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
                <h3 className="text-label-bold text-on-background">Uptime</h3>
                <p className="text-label-sm text-tertiary">99.99% guaranteed via AWS architecture.</p>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
                <h3 className="text-label-bold text-on-background">Speed</h3>
                <p className="text-label-sm text-tertiary">Sub-second page loads across the globe.</p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX3r_Kin-P1o3bCBDjDwaBq9cUj5SXiP9mBAtsCSCqFQvJiAEOuMdOFdyLaC5faorofrxr1VnoyMU-FmHImvSs5kpYWCY3jc78iyCYFswdIO9HrSb-aXq_hYdPly4_2GV_MeS8SjJ4mljIo4eShAHFx6vHc2S6e9b8ilRAwZw68c56muSr2jgE1rVjvGkn4REDPTWjwpijpv1CWDV61CNQ-UfsjRh1j8topcJ_3E_SEHF8KijZsjO5OepHnRHU4lHtRnJGe9Q-YhRx"
              alt="Server room with blue lighting"
              width={1000}
              height={700}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to implement a system?"
        body="Skip the guesswork and deploy a framework that has already scaled dozens of businesses. Your strategy call is the first step."
        primaryLabel="Book a Strategy Call"
      />
    </PageShell>
  );
}
