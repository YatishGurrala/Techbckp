import type { Qualification } from "@/lib/cms";

type QualificationSectionProps = {
  qualification: Qualification;
};

export function QualificationSection({ qualification }: QualificationSectionProps) {
  return (
    <section className="mx-auto max-w-[1000px] px-6 py-section-gap">
      <div className="ambient-shadow grid grid-cols-1 overflow-hidden rounded-2xl border border-outline-variant md:grid-cols-2">
        <div className="bg-surface-container-lowest p-12">
          <h3 className="text-headline-md mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600" aria-hidden>
              check_circle
            </span>
            Who this is for
          </h3>
          <ul className="space-y-4">
            {qualification.goodFit.map((item) => (
              <li key={item} className="flex items-start gap-3 text-tertiary">
                <span className="material-symbols-outlined mt-1" style={{ fontSize: 18 }} aria-hidden>
                  arrow_right
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface-container p-12">
          <h3 className="text-headline-md mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-error" aria-hidden>
              cancel
            </span>
            Who this is not for
          </h3>
          <ul className="space-y-4">
            {qualification.notFit.map((item) => (
              <li key={item} className="flex items-start gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined mt-1" style={{ fontSize: 18 }} aria-hidden>
                  close
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
