import Image from "next/image";
import Link from "next/link";

type HeroSectionProps = {
  html?: string | null;
};

export function HeroSection({ html }: HeroSectionProps = {}) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:px-8 md:grid-cols-2 md:py-32">
      <div className="space-y-stack-lg fade-up">
        {html ? (
          <div
            className="prose max-w-xl prose-headings:tracking-tight prose-h1:text-headline-xl prose-a:text-primary-container dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <h1 className="text-headline-xl max-w-xl text-on-background">
            We help founders, coaches &amp; niche businesses launch{" "}
            <span className="text-primary-container">apps, automation &amp; content systems</span> — without building a tech team.
          </h1>
        )}
        <p className="max-w-lg text-body-lg text-tertiary">
          From idea to launch, we handle everything using proven systems so you can focus on growth.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/contact"
            className="rounded-lg bg-primary-container px-8 py-4 text-label-bold text-on-primary-container shadow transition-all hover:shadow-lg active:scale-95"
          >
            Start Your Project
          </Link>
          <Link
            href="/services"
            className="rounded-lg border border-on-background bg-surface-container-lowest px-8 py-4 text-label-bold text-on-background transition-all hover:bg-surface-container"
          >
            View Services
          </Link>
        </div>
      </div>

      <div className="relative fade-up">
        <div className="ambient-shadow aspect-square overflow-hidden rounded-2xl">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgEJCnGIhML7BzhJMNtRD8OJXSNLndefyt9m_YfwWoJDhb43fxRTP3dLKes7v1WscCoOXADAOYCSQoJTcvIhdECuHvDjMCw9MvR5olfsaqhW4SPDly4xgu9l462wXmB-uy5i-rUogLGmh1Z3O4tW2YNZyDCzrwa6jZUy2VCNGeh1-2przvctfjDFrYvhkwux7xeZeAHycvMnTA9AqbwnmOC9MPbJluuQkio2buvPHLAlwNfel4Nu0_MXy_XczRIy9DKLTT2UYSdVWx"
            alt="Modern abstract digital illustration of intersecting orange and obsidian geometric shapes representing scalable software systems"
            width={1200}
            height={1200}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <div className="ambient-shadow absolute -bottom-3 -left-3 max-w-[180px] rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:-bottom-6 sm:-left-6 sm:max-w-[200px] sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary-container" aria-hidden>
              bolt
            </span>
            <span className="text-label-bold text-on-background">Fast Launch</span>
          </div>
          <p className="text-label-sm text-tertiary">Go live in as little as 14 days with our proven MVP framework.</p>
        </div>
      </div>
    </section>
  );
}
