import { BlogList } from "@/components/marketing/blog-preview";
import { BlogAdminControls } from "@/components/marketing/blog-admin-controls";
import { PageShell } from "@/components/marketing/page-shell";
import { getSortedPosts } from "@/lib/blog";
import { Suspense } from "react";

// Re-fetch from CMS at most every 5 minutes; webhook revalidation handles instant updates.
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getSortedPosts();

  return (
    <PageShell>
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
