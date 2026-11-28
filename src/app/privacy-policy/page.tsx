import type { Metadata } from "next";

import { PageShell } from "@/components/marketing/page-shell";
import { buildPageMetadata, getContactEmail } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How Techbckp handles project inquiries, opt-in analytics, third-party tools, and your privacy rights.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  const contactEmail = getContactEmail();

  return (
    <PageShell>
      <article className="page-wrap max-w-4xl py-16 md:py-20">
        <h1 className="text-headline-xl mb-6 text-on-background">Privacy Policy</h1>
        <div className="prose prose-zinc max-w-none space-y-6 prose-a:text-[#ff8400] dark:prose-invert">
          <p className="text-sm text-tertiary">Effective Date: November 29, 2026</p>
          <p>
            Techbckp (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) respects your privacy. This
            Privacy Policy explains what information is collected when you visit{" "}
            <a href="https://www.techbckp.com">www.techbckp.com</a> or contact us about a project,
            how it is used, and how you can control your data.
          </p>

          <h2>1. Project Inquiries &amp; Direct Communication</h2>
          <p>
            Our Project Brief Builder runs locally in your browser and does not store your draft on
            a website database. When you choose to email us directly at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a> or schedule a strategy call via
            Calendly, we receive the contact details and project requirements you choose to send.
          </p>
          <p>
            We use this information solely to respond to your inquiry, scope potential projects, and
            deliver agreed services. We do not sell or rent your personal information.
          </p>

          <h2>2. Opt-In Website Analytics</h2>
          <p>
            When configured, we use Google Analytics 4 (GA4) to understand which pages, guides, and
            services are most helpful to visitors. Analytics scripts do not load until you
            explicitly accept analytics via our consent banner, and we honor browser Global Privacy
            Control (GPC) and Do Not Track (DNT) signals.
          </p>
          <p>
            We do not send personal information (such as your name, email address, phone number, or
            project descriptions) to Google Analytics, and we strip query parameters from tracked
            page URLs and referrers. You can withdraw or update your consent at any time using{" "}
            <strong>Analytics Preferences</strong> in the site footer.
          </p>

          <h2>3. Third-Party Services &amp; Widgets</h2>
          <ul>
            <li>
              <strong>Calendly:</strong> If you book a strategy call, scheduling details are
              processed under Calendly&apos;s privacy policy.
            </li>
            <li>
              <strong>CiteGPT Chat Widget:</strong> Our website embeds an interactive chat
              assistant to help answer visitor questions. Messages you enter in the widget are
              processed by the chat provider to generate responses.
            </li>
            <li>
              <strong>Email &amp; Hosting Infrastructure:</strong> Our website is hosted on Vercel
              and business email correspondence is handled through our email provider under their
              respective security and privacy practices.
            </li>
          </ul>

          <h2>4. Data Retention &amp; Your Rights</h2>
          <p>
            We retain email correspondence and project records only as long as necessary to
            communicate with you, deliver services, or satisfy legal obligations. Depending on your
            location (including the EU, UK, and US states), you may request access to, correction
            of, or deletion of your personal data at any time.
          </p>

          <h2>5. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy as our services evolve. Updates will be posted on this
            page with a revised effective date.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            To exercise your privacy rights or ask questions about this policy, email{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        </div>
      </article>
    </PageShell>
  );
}
