# Techbckp Website

Lightweight static-first marketing and lead-generation website for **Techbckp** built with Next.js, TypeScript, Tailwind CSS, and local Markdown content, deployed on Vercel.

## Local Development

No database, CMS credentials, or API secrets are required to run or build locally.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

- `npm run dev` — Start local development server
- `npm run build` — Production build
- `npm run start` — Serve production build locally
- `npm run lint` — Run ESLint
- `npm test` — Run Vitest unit tests

## Content Publishing

- **Blog posts & case studies:** Add or edit Markdown files in `content/blog/*.md` (frontmatter: `title`, `excerpt`, `date`, `category`, `readTime`, `author`).
- **Site data (services, pricing, audiences, process):** Edit `src/lib/site-data.ts`.
- **Publishing:** Commit and push to Git; Vercel builds and deploys automatically.

## Environment Variables (All Optional)

| Variable | Scope | Default / Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Defaults to `https://www.techbckp.com`. Canonical domain for metadata, OpenGraph, `robots.txt`, `sitemap.xml`, and JSON-LD. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Public | Optional GA4 measurement ID (`G-XXXXXXXXXX`). Uses opt-in consent, honors GPC/DNT, strips query strings/PII, and supports immediate mid-session consent withdrawal. In GA4 Admin → Web Data Stream → Enhanced Measurement, disable **Page changes based on browser history events** and **Form interactions**. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public | Defaults to `hello@techbckp.com`. Used for direct contact links and the client-side Project Brief Builder. |
| `GOOGLE_SITE_VERIFICATION` | Server-only | Optional HTML meta verification token (not needed if verifying via DNS in Google Search Console). |
| `NEXT_PUBLIC_NOINDEX` | Public | Optional override to force `noindex, nofollow`. Vercel preview deployments (`VERCEL_ENV=preview`) automatically emit `X-Robots-Tag: noindex, nofollow` and omit the sitemap. |

## Contact & Lead Capture

The `/contact` page provides direct Calendly booking, direct email (`hello@techbckp.com`), and a client-side **Project Brief Builder** supporting non-PII URL pre-filling (`?service=`, `?budget=`, `?timeline=`, `?estimate=`) for service pages and free calculators.
