import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

type MarkdownPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
  content: string;
};

type NotionPropertySchema = {
  id: string;
  name: string;
  type: string;
};

type NotionDb = {
  properties?: Record<string, NotionPropertySchema>;
};

type NotionQueryResult = {
  results?: Array<{ id: string }>;
};

type NotionBlock = { id: string };

type NotionChildrenResult = {
  results?: NotionBlock[];
  has_more?: boolean;
  next_cursor?: string | null;
};

export const dynamic = "force-dynamic";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "blog");
const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_API_VERSION = "2022-06-28";

function normalizeSlug(value: string): string {
  return decodeURIComponent(String(value || ""))
    .trim()
    .replace(/^\/+/, "")
    .replace(/^blog\//, "")
    .replace(/\/+$/, "");
}

function authorized(req: NextRequest): boolean {
  const configured = process.env.BLOG_ADMIN_TOKEN ?? process.env.NOTION_WEBHOOK_SECRET ?? "";
  const provided = req.headers.get("x-blog-admin-token") ?? "";
  return Boolean(configured && provided && configured === provided);
}

function notionHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": NOTION_API_VERSION,
    "Content-Type": "application/json",
  };
}

async function notionFetch(pathname: string, init: RequestInit, apiKey: string): Promise<Response> {
  return fetch(`${NOTION_API_BASE}${pathname}`, {
    ...init,
    headers: {
      ...notionHeaders(apiKey),
      ...(init.headers ?? {}),
    },
  });
}

function readMarkdownPosts(): MarkdownPost[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) return [];

  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(POSTS_DIRECTORY, file);
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(raw);
      const fileSlug = file.replace(/\.md$/, "");
      const slug = normalizeSlug(String(data.slug ?? fileSlug));

      return {
        slug,
        title: String(data.title ?? slug),
        excerpt: String(data.excerpt ?? ""),
        date: String(data.date ?? ""),
        category: String(data.category ?? "General"),
        readTime: String(data.readTime ?? "5 min read"),
        author: String(data.author ?? "Techbckp Team"),
        content,
      } satisfies MarkdownPost;
    });
}

async function getDatabaseSchema(databaseId: string, apiKey: string): Promise<Record<string, NotionPropertySchema>> {
  const response = await notionFetch(`/databases/${databaseId}`, { method: "GET" }, apiKey);
  if (!response.ok) {
    throw new Error(`Failed to load Notion database schema (${response.status})`);
  }

  const data = (await response.json()) as NotionDb;
  return data.properties ?? {};
}

function findPropertyKey(
  properties: Record<string, NotionPropertySchema>,
  candidates: string[],
  allowedTypes?: string[],
): string | null {
  const entries = Object.entries(properties);

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    const matched = entries.find(([name, schema]) => {
      if (name.toLowerCase() !== lower) return false;
      if (!allowedTypes || allowedTypes.length === 0) return true;
      return allowedTypes.includes(schema.type);
    });
    if (matched) return matched[0];
  }

  if (!allowedTypes || allowedTypes.length === 0) return null;

  const fallback = entries.find(([, schema]) => allowedTypes.includes(schema.type));
  return fallback ? fallback[0] : null;
}

function richText(content: string) {
  const value = content.trim();
  if (!value) return [];
  return [{ type: "text", text: { content: value.slice(0, 2000) } }];
}

function toNumberOrNull(input: string): number | null {
  const match = input.match(/\d+/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

function notionPropsForPost(
  post: MarkdownPost,
  schema: Record<string, NotionPropertySchema>,
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  const titleKey = findPropertyKey(schema, ["Title", "title", "Name", "name"], ["title"]);
  if (titleKey) {
    output[titleKey] = { title: richText(post.title) };
  }

  const slugKey = findPropertyKey(schema, ["Slug", "slug", "URL Slug", "url_slug", "Path", "path"], ["rich_text", "title"]);
  if (slugKey) {
    const schemaType = schema[slugKey]?.type;
    output[slugKey] =
      schemaType === "title"
        ? { title: richText(post.slug) }
        : { rich_text: richText(post.slug) };
  }

  const excerptKey = findPropertyKey(schema, ["Excerpt", "excerpt", "Summary", "summary", "Description", "description"], ["rich_text", "title"]);
  if (excerptKey && post.excerpt) {
    const schemaType = schema[excerptKey]?.type;
    output[excerptKey] =
      schemaType === "title"
        ? { title: richText(post.excerpt) }
        : { rich_text: richText(post.excerpt) };
  }

  const dateKey = findPropertyKey(schema, ["Date", "date", "Published", "published", "Publish Date"], ["date", "rich_text", "title"]);
  if (dateKey && post.date) {
    const schemaType = schema[dateKey]?.type;
    output[dateKey] =
      schemaType === "date"
        ? { date: { start: post.date } }
        : schemaType === "title"
          ? { title: richText(post.date) }
          : { rich_text: richText(post.date) };
  }

  const categoryKey = findPropertyKey(schema, ["Category", "category", "Topic", "Tag"], ["select", "rich_text", "title"]);
  if (categoryKey && post.category) {
    const schemaType = schema[categoryKey]?.type;
    output[categoryKey] =
      schemaType === "select"
        ? { select: { name: post.category } }
        : schemaType === "title"
          ? { title: richText(post.category) }
          : { rich_text: richText(post.category) };
  }

  const readTimeKey = findPropertyKey(schema, ["ReadTime", "Read Time", "readTime", "read_time"], ["number", "rich_text", "title"]);
  if (readTimeKey && post.readTime) {
    const schemaType = schema[readTimeKey]?.type;
    if (schemaType === "number") {
      const numberValue = toNumberOrNull(post.readTime);
      if (numberValue !== null) output[readTimeKey] = { number: numberValue };
    } else if (schemaType === "title") {
      output[readTimeKey] = { title: richText(post.readTime) };
    } else {
      output[readTimeKey] = { rich_text: richText(post.readTime) };
    }
  }

  const authorKey = findPropertyKey(schema, ["Author", "author", "By", "Writer"], ["rich_text", "title", "select"]);
  if (authorKey && post.author) {
    const schemaType = schema[authorKey]?.type;
    output[authorKey] =
      schemaType === "select"
        ? { select: { name: post.author } }
        : schemaType === "title"
          ? { title: richText(post.author) }
          : { rich_text: richText(post.author) };
  }

  const statusKey = findPropertyKey(schema, ["Status", "status", "State", "state"], ["status", "select", "rich_text", "title"]);
  if (statusKey) {
    const schemaType = schema[statusKey]?.type;
    output[statusKey] =
      schemaType === "status"
        ? { status: { name: "Published" } }
        : schemaType === "select"
          ? { select: { name: "Published" } }
          : schemaType === "title"
            ? { title: richText("Published") }
            : { rich_text: richText("Published") };
  }

  return output;
}

function block(type: string, content: string) {
  return {
    object: "block",
    type,
    [type]: {
      rich_text: [{ type: "text", text: { content: content.slice(0, 2000) } }],
    },
  };
}

function paragraph(content: string) {
  return block("paragraph", content);
}

function heading2(content: string) {
  return block("heading_2", content);
}

function heading3(content: string) {
  return block("heading_3", content);
}

function bullet(content: string) {
  return block("bulleted_list_item", content);
}

function numbered(content: string) {
  return block("numbered_list_item", content);
}

function quote(content: string) {
  return block("quote", content);
}

function divider() {
  return { object: "block", type: "divider", divider: {} };
}

function markdownToBlocks(markdown: string): Array<Record<string, unknown>> {
  const lines = markdown.split(/\r?\n/);
  const blocks: Array<Record<string, unknown>> = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^---+$/.test(line)) {
      blocks.push(divider());
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(heading2(line.slice(3).trim()));
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(heading3(line.slice(4).trim()));
      continue;
    }
    if (line.startsWith("- ")) {
      blocks.push(bullet(line.slice(2).trim()));
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      blocks.push(numbered(line.replace(/^\d+\.\s+/, "").trim()));
      continue;
    }
    if (line.startsWith("> ")) {
      blocks.push(quote(line.slice(2).trim()));
      continue;
    }

    blocks.push(paragraph(line));
  }

  if (blocks.length === 0) {
    blocks.push(paragraph("Draft content"));
  }

  return blocks;
}

function chunk<T>(input: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < input.length; i += size) {
    out.push(input.slice(i, i + size));
  }
  return out;
}

async function findPageIdBySlug(slug: string, databaseId: string, apiKey: string): Promise<string | null> {
  const response = await notionFetch(
    `/databases/${databaseId}/query`,
    {
      method: "POST",
      body: JSON.stringify({
        page_size: 5,
        filter: {
          or: [
            { property: "Slug", rich_text: { equals: slug } },
            { property: "slug", rich_text: { equals: slug } },
            { property: "URL Slug", rich_text: { equals: slug } },
            { property: "url_slug", rich_text: { equals: slug } },
            { property: "Path", rich_text: { equals: slug } },
            { property: "path", rich_text: { equals: slug } },
          ],
        },
      }),
    },
    apiKey,
  );

  if (!response.ok) return null;
  const data = (await response.json()) as NotionQueryResult;
  const hit = (data.results ?? [])[0];
  return hit ? hit.id : null;
}

async function listBlockChildren(blockId: string, apiKey: string): Promise<NotionBlock[]> {
  const out: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (cursor) params.set("start_cursor", cursor);

    const response = await notionFetch(`/blocks/${blockId}/children?${params.toString()}`, { method: "GET" }, apiKey);
    if (!response.ok) break;

    const data = (await response.json()) as NotionChildrenResult;
    out.push(...(data.results ?? []));
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);

  return out;
}

async function clearPageBlocks(pageId: string, apiKey: string): Promise<void> {
  const children = await listBlockChildren(pageId, apiKey);

  for (const child of children) {
    await notionFetch(`/blocks/${child.id}`, { method: "DELETE" }, apiKey);
  }
}

async function appendBlocks(pageId: string, blocks: Array<Record<string, unknown>>, apiKey: string): Promise<void> {
  for (const group of chunk(blocks, 100)) {
    await notionFetch(
      `/blocks/${pageId}/children`,
      {
        method: "PATCH",
        body: JSON.stringify({ children: group }),
      },
      apiKey,
    );
  }
}

async function upsertPostToNotion(
  post: MarkdownPost,
  databaseId: string,
  apiKey: string,
  schema: Record<string, NotionPropertySchema>,
): Promise<{ slug: string; pageId: string; created: boolean }> {
  const properties = notionPropsForPost(post, schema);
  const existingPageId = await findPageIdBySlug(post.slug, databaseId, apiKey);

  let pageId = existingPageId;
  let created = false;

  if (pageId) {
    const updateResponse = await notionFetch(
      `/pages/${pageId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      },
      apiKey,
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update page for slug ${post.slug} (${updateResponse.status})`);
    }
  } else {
    const createResponse = await notionFetch(
      "/pages",
      {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties,
        }),
      },
      apiKey,
    );

    if (!createResponse.ok) {
      throw new Error(`Failed to create page for slug ${post.slug} (${createResponse.status})`);
    }

    const data = (await createResponse.json()) as { id: string };
    pageId = data.id;
    created = true;
  }

  if (!pageId) {
    throw new Error(`No page id resolved for slug ${post.slug}`);
  }

  const blocks = markdownToBlocks(post.content);
  await clearPageBlocks(pageId, apiKey);
  await appendBlocks(pageId, blocks, apiKey);

  return { slug: post.slug, pageId, created };
}

function deleteLocalMarkdown(slug: string): boolean {
  const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

function revalidateForBlog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/blogs/${slug}`);
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.NOTION_API_KEY ?? "";
  const databaseId = process.env.NOTION_DB_BLOG ?? process.env.NOTION_DATABASE_ID ?? "";

  if (!apiKey || !databaseId) {
    return NextResponse.json({ error: "Notion blog env vars are missing" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (action !== "syncAll" && action !== "syncOne") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? normalizeSlug(body.slug) : "";

  const allPosts = readMarkdownPosts();
  const targets = action === "syncOne" ? allPosts.filter((p) => p.slug === slug) : allPosts;

  if (targets.length === 0) {
    return NextResponse.json({ error: "No matching markdown posts found" }, { status: 404 });
  }

  try {
    const schema = await getDatabaseSchema(databaseId, apiKey);
    const results: Array<{ slug: string; pageId: string; created: boolean }> = [];

    for (const post of targets) {
      const synced = await upsertPostToNotion(post, databaseId, apiKey, schema);
      results.push(synced);
      revalidateForBlog(post.slug);
    }

    return NextResponse.json({ ok: true, action, count: results.length, results }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.NOTION_API_KEY ?? "";
  const databaseId = process.env.NOTION_DB_BLOG ?? process.env.NOTION_DATABASE_ID ?? "";

  if (!apiKey || !databaseId) {
    return NextResponse.json({ error: "Notion blog env vars are missing" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? normalizeSlug(body.slug) : "";
  const deleteLocal = body.deleteLocal === true;

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  try {
    const pageId = await findPageIdBySlug(slug, databaseId, apiKey);

    let notionDeleted = false;
    if (pageId) {
      const response = await notionFetch(
        `/pages/${pageId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ archived: true }),
        },
        apiKey,
      );

      if (!response.ok) {
        throw new Error(`Failed to archive Notion page (${response.status})`);
      }
      notionDeleted = true;
    }

    const localDeleted = deleteLocal ? deleteLocalMarkdown(slug) : false;

    revalidateForBlog(slug);

    return NextResponse.json(
      {
        ok: true,
        slug,
        notionDeleted,
        localDeleted,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 },
    );
  }
}
