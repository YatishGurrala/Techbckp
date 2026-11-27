import type { Metadata } from "next";

import { PageShell } from "@/components/marketing/page-shell";
import { getPage } from "@/lib/cms";
import { buildPageMetadata, getContactEmail } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How Techbckp handles project inquiry data, opt-in analytics, cookies, third-party tools, and your privacy rights.",
  path: "/privacy-policy",
});

export default async function PrivacyPolicyPage() {
  const page = await getPage("privacy");
  const contactEmail = getContactEmail();
  const hasCmsContent = Boolean(
    page?.contentHtml && !page.contentHtml.includes("content is being updated"),
  );

  return (
    <PageShell>
      <article className="page-wrap max-w-4xl py-16 md:py-20">
        <h1 className="text-headline-xl mb-6 text-on-background">Privacy Policy</h1>
        {hasCmsContent && page?.contentHtml ? (
          <div
            className="prose prose-zinc max-w-none prose-a:text-[#ff8400] dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: page.contentHtml }}
          />
        ) : (
          <div className="prose prose-zinc max-w-none space-y-6 prose-a:text-[#ff8400] dark:prose-invert">
            <p className="text-sm text-tertiary">Last updated: November 27, 2026</p>
            <p>
              Techbckp (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) respects your privacy. This
              Privacy Policy explains what data we collect on{" "}
              <a href="https://www.techbckp.com">www.techbckp.com</a>, how it is processed, and how
              you can control it.
            </p>

            <h2>1. Project Inquiries &amp; Contact Data</h2>
            <p>
              When you submit a project inquiry through our contact form, we collect the information
              you provide (name, email address, optional company name, service interest, budget
              range, timeline, project description, and non-personal page/campaign attribution such
              as UTM parameters).
            </p>
            <p>
              We store and process inquiry records in our Notion workspace (and any configured
              internal notification webhook) solely to review your request, respond to your inquiry,
              and prepare project proposals. We do not sell your personal information.
            </p>

            <h2>2. Opt-In Website Analytics</h2>
            <p>
              We use Google Analytics 4 (GA4) to understand which pages, guides, and services are
              useful to visitors. Analytics scripts do not load until you explicitly accept
              analytics via our consent banner, and we honor browser Global Privacy Control (GPC)
              and Do Not Track (DNT) signals.
            </p>
            <p>
              We do not send personal information (such as your name, email address, phone number,
              or inquiry text) to Google Analytics, and we strip query parameters from tracked page
              URLs and referrers. You can withdraw or update your consent at any time using the{" "}
              <strong>Analytics Preferences</strong> control in the site footer.
            </p>

            <h2>3. Third-Party Services &amp; Widgets</h2>
            <ul>
              <li>
                <strong>Notion:</strong> Used to store and manage project inquiries submitted via
                our contact form.
              </li>
              <li>
                <strong>Calendly:</strong> If you choose to schedule a strategy call, booking
                information is processed under Calendly&apos;s privacy policy.
              </li>
              <li>
                <strong>CiteGPT Chat Widget:</strong> Our site embeds an interactive chat assistant
                to help answer visitor questions. Messages entered in the chat widget are processed
                by the chat provider to respond to your query.
              </li>
              <li>
                <strong>Vercel:</strong> Hosts our website infrastructure and standard server
                security logs.
              </li>
            </ul>

            <h2>4. Data Retention &amp; Your Rights</h2>
            <p>
              We retain project inquiry records only as long as needed to communicate with you and
              manage potential or active engagements. Depending on your jurisdiction (including the
              EU, UK, and US states), you may request access to, correction of, or deletion of your
              personal information at any time.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              To exercise your privacy rights or ask questions about this policy, email us at{" "}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
          </div>
        )}
      </article>
    </PageShell>
  );
}
