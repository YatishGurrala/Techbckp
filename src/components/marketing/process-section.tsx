import type { ProcessStep } from "@/lib/cms";

type ProcessSectionProps = {
  steps: ProcessStep[];
};

export function ProcessSection({ steps }: ProcessSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-section-gap lg:px-8" id="process">
      <div className="mb-16 flex flex-col items-center justify-between gap-4 md:flex-row">
        <h2 className="text-headline-lg">Our Execution Blueprint</h2>
        <div className="mx-8 hidden h-px flex-grow bg-outline-variant md:block" />
        <p className="text-label-bold text-primary-container">3 STEPS TO LAUNCH</p>
      </div>

      <div className="grid gap-12 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="relative">
            <span
              aria-hidden
              className="absolute -left-4 -top-16 z-0 text-[120px] font-black leading-none text-zinc-300 opacity-80 dark:text-zinc-700"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative z-10">
              <h3 className="text-headline-md mb-stack-md">{step.title}</h3>
              <p className="text-tertiary">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
