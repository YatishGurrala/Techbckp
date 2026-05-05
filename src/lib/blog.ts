import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import {
  getPostBySlugFromNotion,
  isNotionConfigured,
  listPublishedPosts,
  type NotionPost,
  type NotionPostMeta,
} from "./notion-cms";

export type BlogMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
};

export type BlogPost = BlogMeta & {
  contentHtml: string;
};

const postsDirectory = path.join(process.cwd(), "content", "blog");

// Keep backwards compatibility for previously shared links.
const SLUG_ALIASES: Record<string, string> = {
  "from-idea-to-mvp-in-45-days": "30-day-mvp-development-system",
};

function normalizeSlug(value: string): string {
  const decoded = decodeURIComponent(String(value || "")).trim();
  const normalized = decoded.replace(/^\/+/, "").replace(/^blog\//, "").replace(/\/+$/, "");
  return SLUG_ALIASES[normalized] ?? normalized;
}

function sortByDateDesc(a: BlogMeta, b: BlogMeta): number {
  return a.date < b.date ? 1 : -1;
}

function mergePosts(markdownPosts: BlogMeta[], notionPosts: BlogMeta[]): BlogMeta[] {
  const merged = new Map<string, BlogMeta>();

  // Start with markdown so a published Notion post with the same slug can override it.
  for (const post of markdownPosts) merged.set(post.slug, post);
  for (const post of notionPosts) merged.set(post.slug, post);

  return Array.from(merged.values()).sort(sortByDateDesc);
}

function metaFromNotion(post: NotionPostMeta): BlogMeta {
  const slug = normalizeSlug(post.slug);
  return {
    slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    readTime: post.readTime,
    author: post.author,
  };
}

function postFromNotion(post: NotionPost): BlogPost {
  return { ...metaFromNotion(post), contentHtml: post.contentHtml };
}

function readMarkdownPosts(): BlogMeta[] {
  if (!fs.existsSync(postsDirectory)) return [];

  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = normalizeSlug(file.replace(/\.md$/, ""));
      const fullPath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: String(data.title ?? slug),
        excerpt: String(data.excerpt ?? ""),
        date: String(data.date ?? ""),
        category: String(data.category ?? "General"),
        readTime: String(data.readTime ?? "5 min read"),
        author: String(data.author ?? "Techbckp Team"),
      };
    })
    .sort(sortByDateDesc);
}

async function readMarkdownPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalizedSlug = normalizeSlug(slug);
  const fullPath = path.join(postsDirectory, `${normalizedSlug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return {
    slug: normalizedSlug,
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ""),
    date: String(data.date ?? ""),
    category: String(data.category ?? "General"),
    readTime: String(data.readTime ?? "5 min read"),
    author: String(data.author ?? "Techbckp Team"),
    contentHtml,
  };
}

export async function getSortedPosts(): Promise<BlogMeta[]> {
  const markdownPosts = readMarkdownPosts();

  if (isNotionConfigured()) {
    try {
      const notionPosts = (await listPublishedPosts()).map(metaFromNotion);
      return mergePosts(markdownPosts, notionPosts);
    } catch (err) {
      console.warn("[blog] Notion list failed, falling back to markdown", err);
    }
  }
  return markdownPosts;
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const normalizedSlug = normalizeSlug(slug);

  if (isNotionConfigured()) {
    try {
      const post = await getPostBySlugFromNotion(normalizedSlug);
      if (post) return postFromNotion(post);
    } catch (err) {
      console.warn("[blog] Notion fetch failed, falling back to markdown", err);
    }
  }

  const markdownPost = await readMarkdownPostBySlug(normalizedSlug);
  if (!markdownPost) {
    throw new Error(`Post not found: ${normalizedSlug}`);
  }
  return markdownPost;
}
