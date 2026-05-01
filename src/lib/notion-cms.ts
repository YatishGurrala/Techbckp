// Notion-backed CMS layer for blog posts.
// Builds on src/lib/notion-core.ts with: list published posts, fetch page blocks,
// and render a small subset of Notion blocks to HTML for the post body.

import {
  NOTION_API_BASE,
  NOTION_API_VERSION,
  type NotionPageProperties,
  type NotionProperty,
  extractSlug,
  extractStatus,
  extractText,
  isPublishedStatus,
  isValidSlug,
} from "./notion-core";

export type NotionPostMeta = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
};

export type NotionPost = NotionPostMeta & {
  contentHtml: string;
};

type NotionRichText = {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
};

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  paragraph?: { rich_text?: NotionRichText[] };
  heading_1?: { rich_text?: NotionRichText[] };
  heading_2?: { rich_text?: NotionRichText[] };
  heading_3?: { rich_text?: NotionRichText[] };
  bulleted_list_item?: { rich_text?: NotionRichText[] };
  numbered_list_item?: { rich_text?: NotionRichText[] };
  quote?: { rich_text?: NotionRichText[] };
  callout?: { rich_text?: NotionRichText[] };
  code?: { rich_text?: NotionRichText[]; language?: string };
  image?: {
    type?: "external" | "file";
    external?: { url?: string };
    file?: { url?: string };
    caption?: NotionRichText[];
  };
  divider?: Record<string, never>;
  toggle?: { rich_text?: NotionRichText[] };
};

type NotionPageRecord = {
  id: string;
  properties?: NotionPageProperties;
};

const POSTS_PAGE_SIZE = 50;

function getEnv() {
  return {
    apiKey: process.env.NOTION_API_KEY ?? "",
    databaseId: process.env.NOTION_DB_BLOG ?? process.env.NOTION_DATABASE_ID ?? "",
    collectionsId: process.env.NOTION_DB_COLLECTIONS ?? "",
  };
}

export function isNotionConfigured(): boolean {
  const { apiKey, databaseId } = getEnv();
  return Boolean(apiKey && databaseId);
}

export function isCollectionsConfigured(): boolean {
  const { apiKey, collectionsId } = getEnv();
  return Boolean(apiKey && collectionsId);
}

function notionHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": NOTION_API_VERSION,
    "Content-Type": "application/json",
  };
}

function extractDate(properties: NotionPageProperties): string {
  const keys = ["Date", "date", "Published", "published", "Publish Date"];
  for (const key of keys) {
    const prop = properties[key];
    const start = prop?.date?.start;
    if (start) return start;
    const text = extractText(prop);
    if (text) return text;
  }
  return "";
}

function extractAuthor(properties: NotionPageProperties): string {
  const keys = ["Author", "author", "By", "Writer"];
  for (const key of keys) {
    const prop = properties[key];
    if (!prop) continue;
    const peopleName = prop.people?.[0]?.name;
    if (peopleName) return peopleName;
    const text = extractText(prop);
    if (text) return text;
    const select = prop.select?.name;
    if (select) return select;
  }
  return "";
}

function extractCategory(properties: NotionPageProperties): string {
  const keys = ["Category", "category", "Topic", "Tag"];
  for (const key of keys) {
    const prop = properties[key];
    if (!prop) continue;
    const select = prop.select?.name;
    if (select) return select;
    const text = extractText(prop);
    if (text) return text;
  }
  return "";
}

function extractExcerpt(properties: NotionPageProperties): string {
  const keys = ["Excerpt", "excerpt", "Summary", "summary", "Description"];
  for (const key of keys) {
    const text = extractText(properties[key]);
    if (text) return text;
  }
  return "";
}

function extractReadTime(properties: NotionPageProperties): string {
  const keys = ["ReadTime", "Read Time", "readTime", "read_time"];
  for (const key of keys) {
    const prop = properties[key];
    if (!prop) continue;
    const text = extractText(prop);
    if (text) return text;
    if (typeof prop.number === "number") return `${prop.number} min read`;
  }
  return "";
}

function pageToMeta(page: NotionPageRecord): NotionPostMeta | null {
  const properties = page.properties ?? {};
  const slug = extractSlug(properties);
  if (!slug || !isValidSlug(slug)) return null;

  const status = extractStatus(properties);
  if (status && !isPublishedStatus(status)) return null;

  const title = extractText(
    properties.Title ?? properties.title ?? properties.Name ?? properties.name,
  );

  return {
    id: page.id,
    slug,
    title: title || slug,
    excerpt: extractExcerpt(properties),
    date: extractDate(properties),
    category: extractCategory(properties) || "General",
    readTime: extractReadTime(properties) || "5 min read",
    author: extractAuthor(properties) || "Techbckp Team",
  };
}

async function notionFetch(
  path: string,
  init: RequestInit,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<Response> {
  return fetchImpl(`${NOTION_API_BASE}${path}`, {
    ...init,
    headers: { ...notionHeaders(apiKey), ...(init.headers ?? {}) },
  });
}

export async function listPublishedPosts(
  fetchImpl: typeof fetch = fetch,
): Promise<NotionPostMeta[]> {
  const { apiKey, databaseId } = getEnv();
  if (!apiKey || !databaseId) return [];

  const collected: NotionPostMeta[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      page_size: POSTS_PAGE_SIZE,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    };
    if (cursor) body.start_cursor = cursor;

    const response = await notionFetch(
      `/databases/${databaseId}/query`,
      { method: "POST", body: JSON.stringify(body) },
      apiKey,
      fetchImpl,
    );

    if (!response.ok) {
      console.warn("[notion-cms] listPublishedPosts failed", response.status);
      break;
    }

    const data = (await response.json()) as {
      results?: NotionPageRecord[];
      has_more?: boolean;
      next_cursor?: string | null;
    };

    for (const page of data.results ?? []) {
      const meta = pageToMeta(page);
      if (meta) collected.push(meta);
    }

    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);

  return collected.sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function fetchPageRecord(
  pageId: string,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<NotionPageRecord | null> {
  const response = await notionFetch(
    `/pages/${pageId}`,
    { method: "GET" },
    apiKey,
    fetchImpl,
  );
  if (!response.ok) return null;
  return (await response.json()) as NotionPageRecord;
}

async function fetchAllBlocks(
  blockId: string,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (cursor) params.set("start_cursor", cursor);

    const response = await notionFetch(
      `/blocks/${blockId}/children?${params.toString()}`,
      { method: "GET" },
      apiKey,
      fetchImpl,
    );

    if (!response.ok) break;

    const data = (await response.json()) as {
      results?: NotionBlock[];
      has_more?: boolean;
      next_cursor?: string | null;
    };

    blocks.push(...(data.results ?? []));
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRichText(parts: NotionRichText[] | undefined): string {
  if (!parts || parts.length === 0) return "";
  return parts
    .map((part) => {
      let text = escapeHtml(part.plain_text ?? "");
      const a = part.annotations ?? {};
      if (a.code) text = `<code>${text}</code>`;
      if (a.bold) text = `<strong>${text}</strong>`;
      if (a.italic) text = `<em>${text}</em>`;
      if (a.underline) text = `<u>${text}</u>`;
      if (a.strikethrough) text = `<s>${text}</s>`;
      if (part.href) {
        const safeHref = escapeHtml(part.href);
        text = `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">${text}</a>`;
      }
      return text;
    })
    .join("");
}

function renderBlock(block: NotionBlock): string {
  switch (block.type) {
    case "paragraph": {
      const inner = renderRichText(block.paragraph?.rich_text);
      return inner ? `<p>${inner}</p>` : "<p></p>";
    }
    case "heading_1":
      return `<h1>${renderRichText(block.heading_1?.rich_text)}</h1>`;
    case "heading_2":
      return `<h2>${renderRichText(block.heading_2?.rich_text)}</h2>`;
    case "heading_3":
      return `<h3>${renderRichText(block.heading_3?.rich_text)}</h3>`;
    case "quote":
      return `<blockquote>${renderRichText(block.quote?.rich_text)}</blockquote>`;
    case "callout":
      return `<aside class="callout">${renderRichText(block.callout?.rich_text)}</aside>`;
    case "divider":
      return "<hr />";
    case "code": {
      const inner = escapeHtml(
        (block.code?.rich_text ?? []).map((rt) => rt.plain_text ?? "").join(""),
      );
      const lang = block.code?.language ? ` class="language-${escapeHtml(block.code.language)}"` : "";
      return `<pre><code${lang}>${inner}</code></pre>`;
    }
    case "image": {
      const url =
        block.image?.type === "external"
          ? block.image?.external?.url
          : block.image?.file?.url;
      if (!url) return "";
      const safeUrl = escapeHtml(url);
      const caption = renderRichText(block.image?.caption);
      const captionHtml = caption ? `<figcaption>${caption}</figcaption>` : "";
      return `<figure><img src="${safeUrl}" alt="${escapeHtml(
        block.image?.caption?.[0]?.plain_text ?? "",
      )}" loading="lazy" />${captionHtml}</figure>`;
    }
    case "toggle":
      return `<details><summary>${renderRichText(block.toggle?.rich_text)}</summary></details>`;
    default:
      return "";
  }
}

function renderBlocksToHtml(blocks: NotionBlock[]): string {
  // Group consecutive list items so we emit valid <ul>/<ol> elements.
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;
  const buffer: string[] = [];

  const flush = () => {
    if (listType && buffer.length > 0) {
      out.push(`<${listType}>${buffer.join("")}</${listType}>`);
    }
    buffer.length = 0;
    listType = null;
  };

  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      if (listType !== "ul") flush();
      listType = "ul";
      buffer.push(`<li>${renderRichText(block.bulleted_list_item?.rich_text)}</li>`);
      continue;
    }
    if (block.type === "numbered_list_item") {
      if (listType !== "ol") flush();
      listType = "ol";
      buffer.push(`<li>${renderRichText(block.numbered_list_item?.rich_text)}</li>`);
      continue;
    }
    flush();
    out.push(renderBlock(block));
  }
  flush();

  return out.filter(Boolean).join("\n");
}

export async function getPostBySlugFromNotion(
  slug: string,
  fetchImpl: typeof fetch = fetch,
): Promise<NotionPost | null> {
  const { apiKey, databaseId } = getEnv();
  if (!apiKey || !databaseId) return null;
  if (!isValidSlug(slug)) return null;

  // Query DB for matching slug. Try common slug property names; first match wins.
  const slugFilters = ["Slug", "slug", "URL Slug", "url_slug"].map((prop) => ({
    property: prop,
    rich_text: { equals: slug },
  }));

  const response = await notionFetch(
    `/databases/${databaseId}/query`,
    {
      method: "POST",
      body: JSON.stringify({
        page_size: 5,
        filter: { or: slugFilters },
      }),
    },
    apiKey,
    fetchImpl,
  );

  if (!response.ok) return null;

  const data = (await response.json()) as { results?: NotionPageRecord[] };
  const page = (data.results ?? []).find((p) => {
    const meta = pageToMeta(p);
    return meta?.slug === slug;
  });

  if (!page) return null;
  const meta = pageToMeta(page);
  if (!meta) return null;

  const blocks = await fetchAllBlocks(page.id, apiKey, fetchImpl);
  const contentHtml = renderBlocksToHtml(blocks);

  return { ...meta, contentHtml };
}

export async function getPostByPageId(
  pageId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<NotionPost | null> {
  const { apiKey } = getEnv();
  if (!apiKey) return null;

  const page = await fetchPageRecord(pageId, apiKey, fetchImpl);
  if (!page) return null;
  const meta = pageToMeta(page);
  if (!meta) return null;

  const blocks = await fetchAllBlocks(page.id, apiKey, fetchImpl);
  const contentHtml = renderBlocksToHtml(blocks);

  return { ...meta, contentHtml };
}

// ---------------------------------------------------------------------------
// Generic page renderer (free-form prose pages)
// ---------------------------------------------------------------------------

export type NotionPageHtml = {
  id: string;
  title: string;
  contentHtml: string;
};

export async function getPageHtmlById(
  pageId: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<NotionPageHtml | null> {
  const { apiKey } = getEnv();
  if (!apiKey || !pageId) return null;

  const cleanId = pageId.replace(/-/g, "").trim();
  if (!/^[0-9a-f]{32}$/i.test(cleanId)) return null;

  const page = await fetchPageRecord(cleanId, apiKey, fetchImpl);
  if (!page) return null;

  const props = page.properties ?? {};
  const title = extractText(props.Title ?? props.title ?? props.Name ?? props.name);

  const blocks = await fetchAllBlocks(cleanId, apiKey, fetchImpl);
  const contentHtml = renderBlocksToHtml(blocks);

  return { id: cleanId, title, contentHtml };
}

// ---------------------------------------------------------------------------
// Collections database
// ---------------------------------------------------------------------------

export type CollectionName =
  | "service"
  | "pricing"
  | "audience"
  | "process"
  | "nav"
  | "qualification";

export type CollectionRow = {
  id: string;
  name: string;
  collection: string;
  order: number;
  slug: string;
  price: string;
  duration: string;
  subtitle: string;
  description: string;
  items: string[];
  href: string;
  ctaLabel: string;
  bucket: string;
  featured: boolean;
};

function extractMultiSelect(prop: NotionProperty | undefined): string[] {
  if (!prop?.multi_select) return [];
  return prop.multi_select
    .map((opt) => (opt?.name ?? "").trim())
    .filter((value) => value.length > 0);
}

function extractCheckbox(prop: NotionProperty | undefined): boolean {
  return prop?.checkbox === true;
}

function extractNumber(prop: NotionProperty | undefined): number {
  return typeof prop?.number === "number" ? prop.number : 0;
}

function extractSelectName(prop: NotionProperty | undefined): string {
  const value = prop?.select?.name?.trim();
  return value ?? "";
}

function pageToCollectionRow(page: NotionPageRecord): CollectionRow | null {
  const props = page.properties ?? {};
  const status = extractStatus(props);
  if (status && !isPublishedStatus(status)) return null;

  const collection =
    extractSelectName(props.Collection) ||
    extractSelectName(props.collection) ||
    extractText(props.Collection);
  if (!collection) return null;

  const name =
    extractText(props.Name) ||
    extractText(props.Title) ||
    extractText(props.name) ||
    extractText(props.title);
  if (!name) return null;

  return {
    id: page.id,
    name,
    collection: collection.toLowerCase(),
    order: extractNumber(props.Order ?? props.order),
    slug: extractText(props.Slug ?? props.slug),
    price: extractText(props.Price ?? props.price),
    duration: extractText(props.Duration ?? props.duration),
    subtitle: extractText(props.Subtitle ?? props.subtitle),
    description: extractText(props.Description ?? props.description),
    items:
      extractMultiSelect(props.Items ?? props.items) ||
      extractMultiSelect(props.Includes ?? props.Features),
    href: extractText(props.Href ?? props.href ?? props.URL ?? props.Url),
    ctaLabel: extractText(
      props["CTA Label"] ?? props.CtaLabel ?? props.ctaLabel ?? props.cta_label,
    ),
    bucket: extractSelectName(props.Bucket ?? props.bucket),
    featured: extractCheckbox(props.Featured ?? props.featured),
  };
}

async function fetchAllCollectionRows(
  fetchImpl: typeof fetch = fetch,
): Promise<CollectionRow[]> {
  const { apiKey, collectionsId } = getEnv();
  if (!apiKey || !collectionsId) return [];

  const collected: CollectionRow[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await notionFetch(
      `/databases/${collectionsId}/query`,
      { method: "POST", body: JSON.stringify(body) },
      apiKey,
      fetchImpl,
    );

    if (!response.ok) {
      console.warn("[notion-cms] collections query failed", response.status);
      break;
    }

    const data = (await response.json()) as {
      results?: NotionPageRecord[];
      has_more?: boolean;
      next_cursor?: string | null;
    };

    for (const page of data.results ?? []) {
      const row = pageToCollectionRow(page);
      if (row) collected.push(row);
    }

    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);

  return collected;
}

export async function getCollection(
  name: CollectionName,
  fetchImpl: typeof fetch = fetch,
): Promise<CollectionRow[]> {
  const target = name.toLowerCase();
  const rows = await fetchAllCollectionRows(fetchImpl);
  return rows
    .filter((r) => r.collection === target)
    .sort((a, b) => a.order - b.order);
}

