import type { Audience } from "@/lib/cms";

type AudienceCardsProps = {
  audiences: Audience[];
};

const AUDIENCE_META: Record<string, { icon: string; chip: string; chipText: string }> = {
  Founders: { icon: "person_celebrate", chip: "bg-primary-fixed", chipText: "text-on-primary-fixed-variant" },
  "Coaches & Creators": { icon: "psychology", chip: "bg-secondary-container", chipText: "text-on-secondary-container" },
  "Niche Businesses": { icon: "storefront", chip: "bg-tertiary-fixed", chipText: "text-on-tertiary-fixed-variant" },
};

function metaFor(title: string) {
  return AUDIENCE_META[title] ?? { icon: "groups", chip: "bg-primary-fixed", chipText: "text-on-primary-fixed-variant" };
}

export function AudienceCards({ audiences }: AudienceCardsProps) {
  return (
    <section className="bg-surface-container-low py-section-gap">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-headline-lg mb-stack-md">Tailored for Builders &amp; Experts</h2>
          <p className="text-tertiary">We specialize in systems for specific types of high-growth businesses.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {audiences.map((a) => {
            const meta = metaFor(a.title);
            return (
              <article
                key={a.title}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg transition-all hover:shadow-md"
              >
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${meta.chip}`}>
                  <span className={`material-symbols-outlined ${meta.chipText}`} aria-hidden>
                    {meta.icon}
                  </span>
                </div>
                <h3 className="text-headline-md mb-3">{a.title}</h3>
                <p className="text-tertiary">{a.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
