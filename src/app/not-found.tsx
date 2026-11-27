import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for could not be found on Techbckp.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <PageShell>
      <section className="page-wrap flex min-h-[60vh] flex-col items-start justify-center py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-container">
          404 · Not Found
        </p>
        <h1 className="text-headline-xl max-w-2xl text-on-background">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-4 max-w-xl text-body-lg text-tertiary">
          The link may have moved or expired. Explore our services, read our technical insights, or start a conversation with our team.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-lg bg-primary-container px-6 py-3 text-label-bold text-on-primary shadow transition-all hover:opacity-90 active:scale-95"
          >
            Back to Home
          </Link>
          <Link
            href="/services"
            className="rounded-lg border border-on-background bg-surface-container-lowest px-6 py-3 text-label-bold text-on-background transition-all hover:bg-surface-container"
          >
            View Services
          </Link>
          <Link
            href="/blog"
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-3 text-label-bold text-on-background transition-all hover:bg-surface-container"
          >
            Read Blog
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-3 text-label-bold text-on-background transition-all hover:bg-surface-container"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

