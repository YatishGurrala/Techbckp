# Notion CMS — Techbckp Site

The marketing site renders from Notion when env vars are set. It falls back to
the static values in [src/lib/site-data.ts](../src/lib/site-data.ts) and the
markdown files in `content/blog/` whenever Notion is unavailable, so the build
never breaks.

## Workspace layout

Inside one parent Notion page (shared with your integration) create:

- **Inline DB: Blog Posts** — long-form articles for `/blog`.
- **Inline DB: Collections** — every structured list (services, pricing,
  audiences, process steps, nav links, qualification items).
- **Sub-pages** for free-form prose: Hero, About Intro, CTA Default, Footer,
  Contact.

Use the prompt in the project root chat or your Notion AI to scaffold the
schema and seed rows. Conventions:

- Every DB has `Status` (Status property: `Draft` / `Published`). Only
  `Published` rows render.
- Every DB has `Order` (Number). Lower renders first.
- Free-form pages may use: paragraph, heading 1/2/3, bulleted/numbered list,
  quote, callout, code, divider, image, toggle. Anything else is ignored.

## Required env vars

```
NOTION_API_KEY=ntn_xxxxxxxx
NOTION_WEBHOOK_SECRET=any-long-random-string

NOTION_DB_BLOG=<32-char-id>
NOTION_DB_COLLECTIONS=<32-char-id>

NOTION_PAGE_HERO=<32-char-id>
NOTION_PAGE_ABOUT=<32-char-id>
NOTION_PAGE_CTA=<32-char-id>
NOTION_PAGE_FOOTER=<32-char-id>
NOTION_PAGE_CONTACT=<32-char-id>

# optional
NEXT_PUBLIC_GA_MEASUREMENT_ID=
GA_API_SECRET=
```

> Each project connects to its **own** Notion database. The Notionwebapp test
> app uses different IDs — Techbckp uses these.

## Collections schema

| Property      | Type                                                                         | Used by                                 |
| ------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| `Name`        | Title                                                                        | Every collection                        |
| `Collection`  | Select (`service`, `pricing`, `audience`, `process`, `nav`, `qualification`) | Every collection                        |
| `Order`       | Number                                                                       | Every collection                        |
| `Status`      | Status (`Draft`, `Published`)                                                | Every collection                        |
| `Slug`        | Rich text                                                                    | services, pricing                       |
| `Price`       | Rich text                                                                    | services, pricing                       |
| `Duration`    | Rich text                                                                    | services                                |
| `Subtitle`    | Rich text                                                                    | process, pricing tagline                |
| `Description` | Rich text                                                                    | services, audiences, process            |
| `Items`       | Multi-select                                                                 | services `Includes`, pricing `Features` |
| `Href`        | Rich text                                                                    | nav, pricing CTA                        |
| `CTA Label`   | Rich text                                                                    | pricing                                 |
| `Bucket`      | Select (`Good Fit`, `Not a Fit`)                                             | qualification                           |
| `Featured`    | Checkbox                                                                     | services, pricing                       |

Tip: create one Notion view per `Collection` value so editing each list feels
like a separate table.

## Blog Posts schema

| Property            | Type                | Notes                    |
| ------------------- | ------------------- | ------------------------ |
| `Title` (or `Name`) | Title               | Post title               |
| `Slug`              | Rich text           | URL slug                 |
| `Status`            | Status / Select     | Must be `Published`      |
| `Excerpt`           | Rich text           | Listing summary          |
| `Category`          | Select              | E.g. `Automation`        |
| `Date`              | Date                | Publish date             |
| `Author`            | Person / Rich text  | Display name             |
| `ReadTime`          | Rich text or Number | E.g. `9 min read` or `9` |

## Webhook publish flow

Configure Notion automations / external services to POST here on row updates:

```
POST https://<your-domain>/api/notion-publish
Headers:
  Content-Type: application/json
  x-notion-secret: <NOTION_WEBHOOK_SECRET>
Body (any of):
  { "page_id": "<notion-page-id>" }
  { "data": { "id": "<notion-page-id>" } }
  { "source": { "page_id": "<notion-page-id>" } }
```

Behavior:

1. Verify the `x-notion-secret` header.
2. Read the page id and (if missing) the slug/status by fetching the live page.
3. If the page has a `Status` and it is not `Published`, skip.
4. Always revalidate `/`, `/blog`, `/services`, `/process`, `/pricing`,
   `/about`, `/contact`, plus `/blog/<slug>` when the change was a blog post.

For best UX, set up one webhook per database (Blog Posts and Collections) and
one per sub-page so any edit triggers a refresh.

## Diagnostic endpoint

`POST /api/notion-test` runs the same checks as the Notionwebapp console:
validates the API key + database id, optionally fetches a page, and pings the
publish webhook. Useful for verifying credentials and integration access.

## Local fallback

If `NOTION_API_KEY` / `NOTION_DB_BLOG` / `NOTION_DB_COLLECTIONS` are missing,
or any Notion call fails, the site renders the markdown in `content/blog/`
plus the static values in `src/lib/site-data.ts`. This keeps `npm run dev`
and `npm run build` working with zero external dependencies.
