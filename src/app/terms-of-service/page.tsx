import type { Metadata } from "next";

import { PageShell } from "@/components/marketing/page-shell";
import { getPage } from "@/lib/cms";
import { buildPageMetadata, getContactEmail } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "Terms that govern your use of the Techbckp website and services.",
  path: "/terms-of-service",
});

export default async function TermsOfServicePage() {
  const page = await getPage("terms");
  const contactEmail = getContactEmail();

  return (
    <PageShell>
      <article className="page-wrap max-w-4xl py-16 md:py-20">
        <h1 className="text-headline-xl mb-6 text-on-background">Terms of Service</h1>
        {page?.contentHtml ? (
          <div
            className="prose prose-zinc max-w-none prose-a:text-[#ff8400] dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: page.contentHtml }}
          />
        ) : (
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <p>
              Terms of service content is being updated. For questions, email{" "}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
          </div>
        )}
      </article>
    </PageShell>
  );
}
