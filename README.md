This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## SEO, Analytics & Search Console Configuration

- `NEXT_PUBLIC_SITE_URL` (default: `https://www.techbckp.com`): Canonical site origin used across metadata, OpenGraph, `robots.txt`, `sitemap.xml`, and JSON-LD.
- `GOOGLE_SITE_VERIFICATION` (optional, server-only): Verification token rendered as `<meta name="google-site-verification" />` for Google Search Console.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional): GA4 measurement ID (`G-XXXXXXXXXX`). Uses opt-in analytics consent (suitable for EU/UK visitors), respects GPC/DNT, enforces a strict non-PII parameter allowlist, and sends explicit clean `page_view` events. In GA4 Admin → Web Data Stream → Enhanced Measurement, disable **"Page changes based on browser history events"** to avoid double SPA page views.
- `GA_API_SECRET` (optional, server-only): GA4 Measurement Protocol secret for server-side operational diagnostics (never exposed to the browser; lead conversions are tracked once on the client to avoid double counting).
- `NEXT_PUBLIC_NOINDEX` (optional): Set to `true` to block indexing. Vercel preview deployments (`VERCEL_ENV=preview`) emit `X-Robots-Tag: noindex, nofollow` HTTP headers and `<meta name="robots" content="noindex, nofollow">` while allowing crawlers to observe the `noindex` directive (and omitting the sitemap).

## Contact Form Configuration

The contact page uses the native `ContactIntakeForm` component posting to `/api/contact` with rate limiting, duplicate submission protection, honeypot spam protection, pre-fill, and allowlisted UTM/source attribution support.

- `NEXT_PUBLIC_CONTACT_EMAIL` (default: `hello@techbckp.com`): Public fallback email address.
- **Direct Notion Leads Database (recommended, server-only):**
  - `NOTION_API_KEY`: Notion internal integration token shared with your Leads database.
  - `NOTION_LEADS_DB_ID`: 32-character ID of your Notion Leads database. Columns are matched automatically by name/type and full inquiry details are also saved to the page body.
- **Optional Webhook Delivery (server-only):**
  - `CONTACT_FORM_WEBHOOK_URL`: Absolute `https://` URL for a CRM, Slack, or custom automation endpoint.
  - `CONTACT_FORM_WEBHOOK_SECRET`: Shared secret sent as the `x-contact-form-secret` header.

At least one destination (`NOTION_API_KEY` + `NOTION_LEADS_DB_ID`, or `CONTACT_FORM_WEBHOOK_URL`) must be configured and accept the lead before `/api/contact` returns `200 OK`. Otherwise it returns `503` / `502` and directs visitors to fallback email or Calendly booking.

## Buildstack CMS Integration

This app uses Buildstack CMS as a headless backend for homepage and blog content.

Required environment variables:

- `BUILDSTACK_CMS_BASE_URL` (example: `https://cms.builddeck.io`)
- `BUILDSTACK_PROJECT_SLUG`
- `BUILDSTACK_PROJECT_ID`
- `BUILDSTACK_ADMIN_API_KEY`
- `BUILDSTACK_WEBHOOK_SECRET`

The app validates these variables in the server layout and fails fast if any are missing or invalid.

### Run locally

1. Add the required variables to `.env.local`.
2. Install dependencies and start dev server:

```bash
npm install
npm run dev
```

### Test CMS connection

Use the public endpoint directly to confirm project-level reads:

```bash
curl "${BUILDSTACK_CMS_BASE_URL}/api/public/blogs?project=${BUILDSTACK_PROJECT_SLUG}"
```

Verify webhook signature handling in this app:

```bash
node -e 'const c=require("node:crypto");const body=JSON.stringify({type:"blog.published",slug:"example"});const sig=c.createHmac("sha256",process.env.BUILDSTACK_WEBHOOK_SECRET).update(body).digest("hex");console.log(body);console.log(sig);'
```

Then send the payload/signature to:

```bash
curl -X POST "http://localhost:3000/api/buildstack-webhook" \
	-H "Content-Type: application/json" \
	-H "X-Buildstack-Signature: <signature-from-command-above>" \
	-d '<body-from-command-above>'
```
