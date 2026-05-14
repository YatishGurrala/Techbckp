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

## Contact Form Configuration

The contact page includes a structured intake form that posts to `/api/contact`.

- `CONTACT_FORM_WEBHOOK_URL` (optional): Absolute URL for your CRM, Zapier/Make scenario, Slack webhook proxy, or backend collector.
- `CONTACT_FORM_WEBHOOK_SECRET` (optional): Shared secret sent as the `x-contact-form-secret` header.

If `CONTACT_FORM_WEBHOOK_URL` is not set, submissions are still accepted and logged on the server, but they are not forwarded to an external system.

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
