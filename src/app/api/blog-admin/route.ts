import fs from "node:fs";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "blog");

function normalizeSlug(value: string): string {
  return decodeURIComponent(String(value || ""))
    .trim()
    .replace(/^\/+/, "")
    .replace(/^blog\//, "")
    .replace(/\/+$/, "");
}

function authorized(req: NextRequest): boolean {
  const configured = process.env.BLOG_ADMIN_TOKEN ?? process.env.BUILDSTACK_ADMIN_API_KEY ?? "";
  const provided = req.headers.get("x-blog-admin-token") ?? "";
  return Boolean(configured && provided && configured === provided);
}

function listMarkdownSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) return [];
  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

function deleteLocalMarkdown(slug: string): boolean {
  const normalized = normalizeSlug(slug);
  const fullPath = path.join(POSTS_DIRECTORY, `${normalized}.md`);
  if (!fs.existsSync(fullPath)) return false;
  fs.unlinkSync(fullPath);
  return true;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";

  if (action === "syncAll") {
    const slugs = listMarkdownSlugs();
    return NextResponse.json({
      ok: true,
      count: slugs.length,
      results: slugs.map((slug) => ({ slug, created: false })),
      note: "Buildstack sync is managed externally by CMS import/publish workflows.",
    });
  }

  if (action === "syncOne") {
    const slug = normalizeSlug(typeof body.slug === "string" ? body.slug : "");
    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      slug,
      created: false,
      note: "Buildstack sync is managed externally by CMS import/publish workflows.",
    });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = normalizeSlug(typeof body.slug === "string" ? body.slug : "");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const deleteLocal = body.deleteLocal === true;
  const localDeleted = deleteLocal ? deleteLocalMarkdown(slug) : false;

  revalidatePath("/blog");
  revalidatePath(`/blog/${encodeURIComponent(slug)}`);

  return NextResponse.json({
    ok: true,
    localDeleted,
  });
}
