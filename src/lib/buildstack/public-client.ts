import { getBuildstackConfig } from "./env";
import { fetchWithTimeoutRetry, parseJson } from "./http";
import type {
  BuildstackBlog,
  BuildstackContentBlock,
  BuildstackMediaItem,
  BuildstackPage,
  CmsEnvelope,
  CmsResult,
} from "./types";

type UnknownRecord = Record<string, unknown>;

function toRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function pickString(obj: UnknownRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function pickNumber(obj: UnknownRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function pickUnknown(obj: UnknownRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (key in obj) return obj[key];
  }
  return undefined;
}

function normalizeEnvelope<T>(payload: unknown): T {
  const record = toRecord(payload);
  if ("data" in record) {
    return (record as CmsEnvelope<T>).data;
  }
  return payload as T;
}

function toPage(raw: unknown): BuildstackPage {
  const r = toRecord(raw);
  const blocks = Array.isArray(r.contentBlocks) ? (r.contentBlocks as unknown[]) : [];
  const firstHtmlBlock = blocks
    .map((block) => toRecord(block))
    .map((block) => pickString(block, ["contentHtml", "content", "html"]) || pickString(toRecord(block.contentJson), ["html"]))
    .find(Boolean);

  return {
    id: pickString(r, ["id", "_id", "pageId"]),
    slug: pickString(r, ["slug", "path"]),
    title: pickString(r, ["title", "name"]),
    excerpt: pickString(r, ["excerpt", "summary", "description"]),
    contentHtml: pickString(r, ["contentHtml", "content", "html", "bodyHtml", "body"]) || firstHtmlBlock || "",
    updatedAt: pickString(r, ["updatedAt", "updated_at"]) || undefined,
    publishedAt: pickString(r, ["publishedAt", "published_at", "date"]) || undefined,
  };
}

function toBlog(raw: unknown): BuildstackBlog {
  const r = toRecord(raw);
  return {
    id: pickString(r, ["id", "_id", "blogId"]),
    slug: pickString(r, ["slug", "path"]),
    title: pickString(r, ["title", "name"]),
    excerpt: pickString(r, ["excerpt", "summary", "description"]),
    contentHtml: pickString(r, ["contentHtml", "content", "html", "bodyHtml", "body"]),
    category: pickString(r, ["category", "topic"], "General"),
    author: pickString(r, ["author", "authorName"], "Techbckp Team"),
    readTime: pickString(r, ["readTime", "read_time"], "5 min read"),
    publishedAt: pickString(r, ["publishedAt", "published_at", "date"]),
    updatedAt: pickString(r, ["updatedAt", "updated_at"]) || undefined,
  };
}

function toContentBlock(raw: unknown): BuildstackContentBlock {
  const r = toRecord(raw);
  const contentJson = pickUnknown(r, ["contentJson", "data", "json", "payload"]);
  const contentJsonRecord = toRecord(contentJson);
  return {
    id: pickString(r, ["id", "_id", "blockId"]),
    key: pickString(r, ["key", "slug", "name"]),
    title: pickString(r, ["title", "name"]) || undefined,
    body: pickString(r, ["body", "text", "description"]) || undefined,
    contentHtml: pickString(r, ["contentHtml", "content", "html"]) || pickString(contentJsonRecord, ["html"]) || undefined,
    data: contentJson ?? undefined,
    updatedAt: pickString(r, ["updatedAt", "updated_at"]) || undefined,
  };
}

function toMedia(raw: unknown): BuildstackMediaItem {
  const r = toRecord(raw);
  return {
    id: pickString(r, ["id", "_id", "mediaId"]),
    url: pickString(r, ["url", "src", "publicUrl"]),
    alt: pickString(r, ["alt", "altText"]) || undefined,
    key: pickString(r, ["key", "slug"]) || undefined,
    mimeType: pickString(r, ["mimeType", "mime_type", "type"]) || undefined,
    width: pickNumber(r, ["width"]),
    height: pickNumber(r, ["height"]),
    updatedAt: pickString(r, ["updatedAt", "updated_at"]) || undefined,
  };
}

async function getJson<T>(path: string): Promise<CmsResult<T>> {
  const { baseUrl } = getBuildstackConfig();

  const response = await fetchWithTimeoutRetry(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return response;

  const parsed = await parseJson<unknown>(response.data);
  if (!parsed.ok) return parsed as CmsResult<T>;

  return {
    ok: true,
    data: normalizeEnvelope<T>(parsed.data),
    status: parsed.status,
  };
}

function withProject(path: string): string {
  const { projectSlug } = getBuildstackConfig();
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}project=${encodeURIComponent(projectSlug)}`;
}

export async function getPublicPage(pageSlug: string): Promise<CmsResult<BuildstackPage | null>> {
  const result = await getJson<unknown>(withProject(`/api/public/pages?slug=${encodeURIComponent(pageSlug)}`));
  if (!result.ok) return result;

  const source = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!source) return { ok: true, data: null };

  return {
    ok: true,
    data: toPage(source),
  };
}

export async function getPublicBlogs(): Promise<CmsResult<BuildstackBlog[]>> {
  const result = await getJson<unknown>(withProject("/api/public/blogs"));
  if (!result.ok) return result;

  const list = Array.isArray(result.data)
    ? result.data
    : Array.isArray(toRecord(result.data).items)
      ? (toRecord(result.data).items as unknown[])
      : [];

  return {
    ok: true,
    data: list.map(toBlog).filter((item) => Boolean(item.slug && item.title)),
  };
}

export async function getPublicBlogBySlug(blogSlug: string): Promise<CmsResult<BuildstackBlog | null>> {
  const result = await getJson<unknown>(withProject(`/api/public/blogs?slug=${encodeURIComponent(blogSlug)}`));
  if (!result.ok) return result;

  const source = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!source) return { ok: true, data: null };

  return {
    ok: true,
    data: toBlog(source),
  };
}

export async function getPublicContentBlock(key: string): Promise<CmsResult<BuildstackContentBlock | null>> {
  const result = await getJson<unknown>(
    withProject(`/api/public/content-blocks?key=${encodeURIComponent(key)}`),
  );
  if (!result.ok) return result;

  const source = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!source) return { ok: true, data: null };

  return {
    ok: true,
    data: toContentBlock(source),
  };
}

export async function getPublicMedia(): Promise<CmsResult<BuildstackMediaItem[]>> {
  const result = await getJson<unknown>(withProject("/api/public/media"));
  if (!result.ok) return result;

  const list = Array.isArray(result.data)
    ? result.data
    : Array.isArray(toRecord(result.data).items)
      ? (toRecord(result.data).items as unknown[])
      : [];

  return {
    ok: true,
    data: list.map(toMedia).filter((item) => Boolean(item.url)),
  };
}

export const __testUtils = {
  normalizeEnvelope,
  toBlog,
  toPage,
  toContentBlock,
  toMedia,
};
