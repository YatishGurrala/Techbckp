import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogAdminControls } from "@/components/marketing/blog-admin-controls";
import { BlogList } from "@/components/marketing/blog-preview";
import { PageShell } from "@/components/marketing/page-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { getSortedPosts } from "@/lib/blog";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Technical Insights & Blog",
  description:
    "Practical guides on MVP development, business automation, software architecture, and execution systems for founders.",
  path: "/blog",
});

// Re-fetch from CMS at most every 5 minutes; webhook revalidation handles instant updates.
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getSortedPosts();

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 md:py-20">
        <h1 className="text-headline-xl max-w-3xl text-on-background">Technical Insights</h1>
        <p className="mt-stack-md max-w-2xl text-body-lg text-tertiary">
          Articles on automation, development, and system growth for modern founders.
        </p>
      </section>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Suspense fallback={null}>
          <BlogAdminControls posts={posts} />
        </Suspense>
        <BlogList posts={posts} />
      </div>
    </PageShell>
  );
}
