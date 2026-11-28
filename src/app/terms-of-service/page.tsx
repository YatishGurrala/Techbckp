import type { Metadata } from "next";

import { PageShell } from "@/components/marketing/page-shell";
import { buildPageMetadata, getContactEmail } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "Terms that govern your use of the Techbckp website and software engineering services.",
  path: "/terms-of-service",
});

export default function TermsOfServicePage() {
  const contactEmail = getContactEmail();

  return (
    <PageShell>
      <article className="page-wrap max-w-4xl py-16 md:py-20">
        <h1 className="text-headline-xl mb-6 text-on-background">Terms of Service</h1>
        <div className="prose prose-zinc max-w-none space-y-6 prose-a:text-[#ff8400] dark:prose-invert">
          <p className="text-sm text-tertiary">Effective Date: November 29, 2026</p>
          <p>
            Welcome to Techbckp. By accessing or using{" "}
            <a href="https://www.techbckp.com">www.techbckp.com</a> and our related services, you
            agree to the following Terms of Service.
          </p>

          <h2>1. Use of Website &amp; Services</h2>
          <p>You agree to use our website and resources only for lawful purposes. You must not:</p>
          <ul>
            <li>Violate any applicable laws or regulations.</li>
            <li>Misuse, disrupt, or attempt to exploit our website or third-party integrations.</li>
            <li>Attempt unauthorized access to any system, account, or infrastructure.</li>
          </ul>

          <h2>2. Services &amp; Project Engagements</h2>
          <p>
            Techbckp provides software engineering, MVP development, workflow automation, website
            development, and technical advisory services. Pricing ranges, timelines, and tool
            estimates shown on this website are illustrative starting points and do not constitute a
            binding quotation.
          </p>
          <p>
            Specific deliverables, timelines, intellectual property transfer, payment milestones,
            and support terms for paid client work are governed by a separate written proposal or
            service agreement signed by both parties.
          </p>

          <h2>3. Payments &amp; Refunds</h2>
          <ul>
            <li>Payment terms and billing schedules are defined in each client project agreement.</li>
            <li>Published starting prices on this website may be updated from time to time.</li>
            <li>Refund eligibility, if any, is governed strictly by the signed project agreement.</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            All website content, branding, copy, designs, and original resources published on{" "}
            <a href="https://www.techbckp.com">www.techbckp.com</a> are owned by Techbckp unless
            stated otherwise. You may not copy, resell, or redistribute our site materials for
            commercial use without prior written permission.
          </p>

          <h2>5. Third-Party Links &amp; Tools</h2>
          <p>
            This website links to or embeds third-party services such as Calendly and CiteGPT. Your
            use of third-party services is subject to their respective terms and privacy policies.
          </p>

          <h2>6. Disclaimer &amp; Limitation of Liability</h2>
          <p>
            This website and its free informational content are provided &ldquo;as is&rdquo; without
            warranties of any kind. To the maximum extent permitted by law, Techbckp is not liable
            for any indirect, incidental, or consequential damages, loss of data, or business
            interruption arising from your use of this website.
          </p>

          <h2>7. Changes to These Terms</h2>
          <p>
            We may update these Terms of Service from time to time. Continued use of the website
            after updates are posted constitutes acceptance of the revised terms.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            For questions regarding these terms, email{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        </div>
      </article>
    </PageShell>
  );
}
