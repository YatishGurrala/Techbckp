import Image from "next/image";

import type { ProcessStep } from "@/lib/cms";

type ProcessTimelineProps = {
  steps: ProcessStep[];
};

const STEP_DETAILS: Record<
  string,
  { tag: string; sub?: { icon: string; title: string; body: string }[] }
> = {
  Idea: {
    tag: "Discovery & Scoping",
    sub: [
      { icon: "search", title: "Market Analysis", body: "Validating demand and identifying competitive advantages." },
      { icon: "architecture", title: "Tech Blueprint", body: "Defining the optimal stack and data architecture." },
    ],
  },
  Build: {
    tag: "Development & Implementation",
    sub: [
      { icon: "terminal", title: "Agile Sprints", body: "Bi-weekly deliverables ensuring transparency and alignment." },
      { icon: "settings_input_component", title: "API Integration", body: "Seamlessly connecting your ecosystem's vital tools." },
    ],
  },
  Launch: {
    tag: "Deployment & Support",
    sub: [
      { icon: "rocket_launch", title: "Scale Ops", body: "Automated scaling and load management protocols." },
      { icon: "support_agent", title: "Active Audit", body: "Continuous security and performance monitoring." },
    ],
  },
};

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <section className="mb-section-gap mx-auto max-w-7xl grid grid-cols-1 gap-gutter px-6 lg:grid-cols-12 lg:px-8">
      <div className="space-y-24 lg:col-span-8">
        {steps.map((step, index) => {
          const details = STEP_DETAILS[step.title] ?? { tag: step.subtitle };
          const isLast = index === steps.length - 1;
          return (
            <div key={step.title} className="relative flex gap-gutter">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[20px] top-[40px] bottom-[-96px] w-0.5 bg-outline-variant"
                />
              )}
              <div className="z-10 flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <div>
                <h2 className="text-headline-lg mb-stack-md text-on-background">{step.title}</h2>
                <span className="mb-stack-md inline-block rounded bg-surface-container px-3 py-1 text-label-bold uppercase tracking-wider text-on-tertiary-container">
                  {details.tag}
                </span>
                <p className="mb-stack-lg text-body-lg leading-relaxed text-tertiary">{step.description}</p>

                {details.sub ? (
                  <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
                    {details.sub.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-lg border border-outline-variant bg-surface-container-low p-stack-md"
                      >
                        <span className="material-symbols-outlined mb-stack-sm text-primary" aria-hidden>
                          {item.icon}
                        </span>
                        <h4 className="text-label-bold text-on-background">{item.title}</h4>
                        <p className="text-label-sm text-tertiary">{item.body}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <aside className="space-y-gutter lg:col-span-4">
        <div className="ambient-shadow rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter">
          <h3 className="text-headline-md mb-stack-md text-on-background">The Techbckp Edge</h3>
          <ul className="space-y-stack-md">
            {[
              "Zero technical debt architecture",
              "Fixed-timeline delivery",
              "Full IP ownership transfer",
            ].map((item) => (
              <li key={item} className="flex items-start gap-stack-sm">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }} aria-hidden>
                  check_circle
                </span>
                <span className="text-body-md text-tertiary">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="group relative aspect-video overflow-hidden rounded-xl border border-outline-variant lg:aspect-[4/5]">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
            alt="Sophisticated data dashboard with orange and graphite analytics"
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-on-background/80 to-transparent p-gutter">
            <p className="text-headline-md leading-tight text-white">Data-driven execution at every stage.</p>
          </div>
        </div>
      </aside>
    </section>
  );
}

export function TechStack() {
  const stack = [
    { name: "DigitalOcean", icon: "cloud" },
    { name: "Flutter", icon: "flutter_dash" },
    { name: "Android", icon: "android" },
    { name: "Next.js", icon: "code" },
    { name: "Notion", icon: "description" },
    { name: "Postgres", icon: "database" },
    { name: "Nginx", icon: "lan" },
    { name: "Stripe", icon: "api" },
    { name: "Docker", icon: "inventory_2" },
    { name: "OpenAI", icon: "smart_toy" },
    { name: "GitHub", icon: "code_blocks" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mb-section-gap rounded-2xl bg-surface-container-low p-gutter lg:p-16">
        <div className="mb-stack-lg text-center">
          <h2 className="text-headline-lg mb-stack-sm text-on-background">Our Tech Stack</h2>
          <p className="mx-auto max-w-2xl text-body-md text-tertiary">
            We leverage industry-leading platforms to ensure stability, speed, and security.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-stack-lg md:grid-cols-4 lg:grid-cols-6">
          {stack.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md grayscale transition-all hover:grayscale-0"
            >
              <span className="material-symbols-outlined mb-stack-sm" style={{ fontSize: 32 }} aria-hidden>
                {item.icon}
              </span>
              <span className="text-label-bold text-on-background">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SuccessMetrics() {
  const metrics = [
    { value: "99.9%", title: "System Uptime", body: "Guaranteed reliability through redundant infrastructure and automated error handling." },
    { value: "40%", title: "OpEx Reduction", body: "Average cost savings for clients after implementing our automated workflow systems." },
    { value: "<120ms", title: "Response Time", body: "Optimized frontend performance ensuring rapid interactions and high user retention." },
  ];

  return (
    <section className="mx-auto mb-section-gap max-w-7xl px-6 lg:px-8">
      <h2 className="text-headline-lg mb-12 text-center text-on-background">Success Metrics</h2>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm transition-all hover:shadow-md"
          >
            <div className="text-headline-xl mb-stack-sm text-primary-container">{m.value}</div>
            <h3 className="text-label-bold mb-stack-sm text-on-background">{m.title}</h3>
            <p className="text-label-sm text-tertiary">{m.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
