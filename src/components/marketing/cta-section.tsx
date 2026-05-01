import Link from "next/link";

type CTASectionProps = {
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  variant?: "dark" | "light";
  html?: string | null;
};

export function CTASection({
  title = "Ready to launch your idea without confusion?",
  body = "Skip the hiring process and the technical debt. Let us build your execution engine.",
  primaryLabel = "Start Your Project Now",
  primaryHref = "/contact",
  secondaryLabel,
  secondaryHref,
  variant = "dark",
  html,
}: CTASectionProps) {
  if (variant === "light") {
    return (
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-xl border border-outline-variant bg-surface-container-low py-section-gap text-center">
          <h2 className="text-headline-lg text-on-background">{title}</h2>
          <p className="mx-auto mt-stack-md max-w-2xl px-6 text-body-lg text-tertiary">{body}</p>
          <div className="mt-stack-lg flex flex-wrap items-center justify-center gap-3">
            <Link
              href={primaryHref}
              className="rounded-lg bg-primary-container px-8 py-4 text-label-bold text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95"
            >
              {primaryLabel}
            </Link>
            {secondaryLabel && secondaryHref ? (
              <Link
                href={secondaryHref}
                className="rounded-lg border border-on-background bg-surface-container-lowest px-8 py-4 text-label-bold text-on-background transition-all hover:bg-zinc-50"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mb-20 max-w-7xl px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-xl bg-zinc-900 px-6 py-10 text-center text-white sm:p-12 md:p-16">
        <div
          aria-hidden
          className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary-container/20 blur-[120px]"
        />
        <div className="relative z-10">
          {html ? (
            <div
              className="prose prose-invert mx-auto max-w-3xl prose-headings:tracking-tight prose-a:text-primary-container"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <>
              <h2 className="text-headline-xl mb-stack-md">{title}</h2>
              <p className="mx-auto mb-8 max-w-xl text-body-lg text-zinc-400">{body}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={primaryHref}
                  className="rounded-lg bg-primary-container px-8 py-4 text-label-bold text-on-primary-container shadow transition-all hover:opacity-90 active:scale-95"
                >
                  {primaryLabel}
                </Link>
                {secondaryLabel && secondaryHref ? (
                  <Link
                    href={secondaryHref}
                    className="rounded-lg bg-surface-container-lowest px-8 py-4 text-label-bold text-on-background transition hover:bg-zinc-100"
                  >
                    {secondaryLabel}
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
