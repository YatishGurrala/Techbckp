import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

function requireEnv(name) {
  const value = String(process.env[name] ?? "").trim();
  if (!value) {
    throw new Error(`[sync-buildstack] Missing required env: ${name}`);
  }
  return value;
}

const config = {
  baseUrl: requireEnv("BUILDSTACK_CMS_BASE_URL").replace(/\/$/, ""),
  projectSlug: requireEnv("BUILDSTACK_PROJECT_SLUG"),
  projectId: requireEnv("BUILDSTACK_PROJECT_ID"),
  adminApiKey: requireEnv("BUILDSTACK_ADMIN_API_KEY"),
};

const postsDirectory = path.join(process.cwd(), "content", "blog");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(method, pathname, body) {
  const response = await fetch(`${config.baseUrl}${pathname}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.adminApiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${method} ${pathname} -> ${response.status} ${text}`);
  }

  try {
    return await response.json();
  } catch {
    return { ok: true };
  }
}

async function publicGet(pathname) {
  const response = await fetch(`${config.baseUrl}${pathname}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`GET ${pathname} -> ${response.status}`);
  }

  return response.json();
}

function toObject(payload) {
  return payload && typeof payload === "object" ? payload : {};
}

function extractId(payload) {
  const value = toObject(payload);
  if (typeof value.id === "string") return value.id;
  if (value.data && typeof value.data === "object" && typeof value.data.id === "string") {
    return value.data.id;
  }
  return null;
}

function unpack(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    // single-resource wrappers: { page }, { blog }, { block }, { contentBlock }
    for (const key of ["page", "blog", "block", "contentBlock", "data"]) {
      if (payload[key] && typeof payload[key] === "object" && !Array.isArray(payload[key])) {
        return [payload[key]];
      }
    }
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.pages)) return payload.pages;
    if (Array.isArray(payload.blogs)) return payload.blogs;
    if (Array.isArray(payload.blocks)) return payload.blocks;
  }
  return [];
}

async function upsertPage(input) {
  const slug = encodeURIComponent(input.slug);
  const existingPayload = await publicGet(`/api/public/pages?project=${encodeURIComponent(config.projectSlug)}&slug=${slug}`);
  const existing = existingPayload ? unpack(existingPayload)[0] : null;

  if (existing && existing.id) {
    const patched = await request("PATCH", "/api/admin/pages", {
      id: existing.id,
      projectId: config.projectId,
      title: input.title,
      slug: input.slug,
      status: input.status,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    });
    return { action: "updated", id: extractId(patched) ?? existing.id };
  }

  const created = await request("POST", "/api/admin/pages", {
    projectId: config.projectId,
    title: input.title,
    slug: input.slug,
    status: input.status,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  });
  let id = extractId(created) ?? unpack(created)[0]?.id ?? null;
  // fall back to public GET if admin create response did not include ID
  if (!id) {
    const slug = encodeURIComponent(input.slug);
    const fetched = await publicGet(`/api/public/pages?project=${encodeURIComponent(config.projectSlug)}&slug=${slug}`);
    id = fetched ? (unpack(fetched)[0]?.id ?? null) : null;
  }
  return { action: "created", id };
}

async function upsertContentBlock(input) {
  const key = encodeURIComponent(input.key);
  const existingPayload = await publicGet(`/api/public/content-blocks?project=${encodeURIComponent(config.projectSlug)}&key=${key}`);
  const existing = existingPayload ? unpack(existingPayload)[0] : null;

  if (existing && existing.id) {
    await request("PATCH", "/api/admin/content-blocks", { id: existing.id, ...input });
    return "updated";
  }

  await request("POST", "/api/admin/content-blocks", input);
  return "created";
}

async function upsertBlog(input) {
  const slug = encodeURIComponent(input.slug);
  const existingPayload = await publicGet(`/api/public/blogs?project=${encodeURIComponent(config.projectSlug)}&slug=${slug}`);
  const existing = existingPayload ? unpack(existingPayload)[0] : null;

  if (existing && existing.id) {
    await request("PATCH", "/api/admin/blogs", { id: existing.id, ...input });
    return "updated";
  }

  await request("POST", "/api/admin/blogs", input);
  return "created";
}

function getWebsiteSeed() {
  return {
    pages: [
      {
        slug: "home",
        title: "Techbckp Home",
        status: "PUBLISHED",
        seoTitle: "Techbckp | Execution Partner for Founders & Niche Businesses",
        seoDescription: "Techbckp helps founders, coaches, creators, and niche businesses launch apps, automation, websites, and content systems without hiring a tech team.",
      },
      {
        slug: "about",
        title: "About Techbckp",
        status: "PUBLISHED",
      },
      {
        slug: "privacy-policy",
        title: "Privacy Policy",
        status: "PUBLISHED",
      },
      {
        slug: "terms-of-service",
        title: "Terms of Service",
        status: "PUBLISHED",
      },
      {
        slug: "contact",
        title: "Contact",
        status: "PUBLISHED",
      },
    ],
    blocks: [
      {
        pageSlug: "home",
        type: "HERO",
        key: "home-hero",
        title: "Homepage Hero",
        sortOrder: 0,
        contentJson: {
          html: "<h1>We help founders, coaches &amp; niche businesses launch <span style='color:#ff8400'>apps, automation &amp; content systems</span> without building a tech team.</h1><p>From idea to launch, we handle everything using proven systems so you can focus on growth.</p>",
        },
      },
      {
        pageSlug: "home",
        type: "TEXT",
        key: "home-services",
        title: "Homepage Services",
        sortOrder: 1,
        contentJson: {
          services: [
            {
              name: "MVP Launch System",
              price: "$2,000+",
              duration: "45 Days",
              description: "Launch your app or SaaS product quickly with a clean roadmap, product architecture, and a launch-ready version.",
              includes: ["Core feature roadmap", "Scalable tech stack", "Cloud infrastructure setup", "Deployment and launch"],
            },
            {
              name: "Business Automation Setup",
              price: "$500+",
              duration: "30 Days",
              description: "Replace repetitive tasks with connected workflows, reporting, and systems your team can actually maintain.",
              includes: ["Workflow automation", "API integrations", "Data synchronization", "Training and support"],
              featured: true,
            },
            {
              name: "Conversion Website Setup",
              price: "$500 - $1,500",
              duration: "21 Days",
              description: "Build high-converting websites with focused messaging, fast pages, and clear CTAs for your offer.",
              includes: ["Custom design", "Responsive development", "SEO foundations", "Performance optimization"],
            },
            {
              name: "Content Growth System",
              price: "$300+",
              duration: "90 Days",
              description: "Turn your expertise into a repeatable content engine that builds trust and generates qualified leads.",
              includes: ["Content strategy", "Production workflow", "Distribution automation", "Analytics and reporting"],
            },
          ],
        },
      },
      {
        pageSlug: "home",
        type: "TEXT",
        key: "home-audiences",
        title: "Homepage Audiences",
        sortOrder: 2,
        contentJson: {
          audiences: [
            { title: "Founders", body: "Launch faster without hiring a full tech team. We help you validate and ship with confidence." },
            { title: "Coaches & Creators", body: "Productize your expertise with systems that sell while you focus on serving your audience." },
            { title: "Niche Businesses", body: "From fitness to eCommerce to digital brands, we build systems that remove execution bottlenecks." },
          ],
        },
      },
      {
        pageSlug: "home",
        type: "TEXT",
        key: "home-process",
        title: "Homepage Process",
        sortOrder: 3,
        contentJson: {
          steps: [
            {
              title: "Idea",
              subtitle: "We refine what to build",
              description: "We clarify your offer, define your fastest path to results, and map what truly matters for version one.",
            },
            {
              title: "Build",
              subtitle: "We use proven systems and templates",
              description: "Execution starts with tested foundations. We build with reusable systems to move fast without chaos.",
            },
            {
              title: "Launch",
              subtitle: "Your product or system is ready for growth",
              description: "We ship your solution with clear handoff and optimization priorities so growth is the next move, not a guess.",
            },
          ],
        },
      },
      {
        pageSlug: "home",
        type: "FAQ",
        key: "home-qualification",
        title: "Homepage Qualification",
        sortOrder: 4,
        contentJson: {
          goodFit: [
            "Founders with a clear problem to solve",
            "Experts looking to productize services",
            "Businesses needing systems, not random tasks",
          ],
          notFit: [
            "One-off design-only requests",
            "Projects without clear ownership",
            "Teams looking only for cheap labor",
          ],
        },
      },
      {
        pageSlug: "home",
        type: "CTA",
        key: "home-pricing",
        title: "Homepage Pricing",
        sortOrder: 5,
        contentJson: {
          tiers: [
            {
              name: "MVP Launch System",
              price: "$2,000+",
              tagline: "Launch your app fast with a stable foundation.",
              features: ["Core feature roadmap", "Scalable tech stack", "Cloud setup", "Launch support"],
              ctaLabel: "Start Project",
              ctaHref: "/contact",
            },
            {
              name: "Business Automation Setup",
              price: "$500+",
              tagline: "Eliminate repetitive work with durable automations.",
              features: ["Workflow automation", "API integrations", "Data sync", "Training and support"],
              ctaLabel: "Start Project",
              ctaHref: "/contact",
              featured: true,
            },
          ],
        },
      },
      {
        pageSlug: "about",
        type: "TEXT",
        key: "about-page",
        title: "About",
        sortOrder: 0,
        contentJson: { html: "<h2>About Techbckp</h2><p>We build execution systems that help founders ship faster and scale with confidence.</p>" },
      },
      {
        pageSlug: "home",
        type: "CTA",
        key: "global-cta",
        title: "Global CTA",
        sortOrder: 6,
        contentJson: { html: "<h3>Ready to ship faster?</h3><p>Book a strategy call and we will map your fastest path from idea to launch.</p>" },
      },
      {
        pageSlug: "home",
        type: "TEXT",
        key: "global-footer",
        title: "Global Footer",
        sortOrder: 7,
        contentJson: { html: "<p>Techbckp - Execution systems for founders and niche businesses.</p>" },
      },
      {
        pageSlug: "contact",
        type: "TEXT",
        key: "contact-page",
        title: "Contact",
        sortOrder: 0,
        contentJson: { html: "<h2>Start Your Project</h2><p>Tell us what you are building and we will help you ship with speed and clarity.</p>" },
      },
      {
        pageSlug: "privacy-policy",
        type: "TEXT",
        key: "privacy-policy",
        title: "Privacy Policy",
        sortOrder: 0,
        contentJson: { html: "<p>Privacy policy content is being updated. For questions, email <a href='mailto:contact@techbckp.com'>contact@techbckp.com</a>.</p>" },
      },
      {
        pageSlug: "terms-of-service",
        type: "TEXT",
        key: "terms-of-service",
        title: "Terms of Service",
        sortOrder: 0,
        contentJson: { html: "<p>Terms of service content is being updated. For questions, email <a href='mailto:contact@techbckp.com'>contact@techbckp.com</a>.</p>" },
      },
    ],
  };
}

async function getMarkdownBlogs() {
  if (!fs.existsSync(postsDirectory)) return [];

  const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
  const blogs = [];

  for (const file of files) {
    const fullPath = path.join(postsDirectory, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);
    const rendered = await remark().use(html).process(content);

    blogs.push({
      projectId: config.projectId,
      slug: String(data.slug ?? file.replace(/\.md$/, "")),
      title: String(data.title ?? file.replace(/\.md$/, "")),
      excerpt: String(data.excerpt ?? ""),
      content: rendered.toString(),
      status: "PUBLISHED",
      seoTitle: String(data.title ?? file.replace(/\.md$/, "")),
      seoDescription: String(data.excerpt ?? ""),
    });
  }

  return blogs;
}

async function main() {
  console.log(`[sync-buildstack] syncing project ${config.projectSlug} (${config.projectId})`);

  const seed = getWebsiteSeed();
  const blogs = await getMarkdownBlogs();

  const summary = {
    pages: { created: 0, updated: 0, skipped: 0 },
    blocks: { created: 0, updated: 0, skipped: 0 },
    blogs: { created: 0, updated: 0, skipped: 0 },
  };

  const pageIds = new Map();

  for (const page of seed.pages) {
    const result = await upsertPage(page);
    summary.pages[result.action] += 1;
    if (result.id) pageIds.set(page.slug, result.id);
    await sleep(50);
  }

  for (const block of seed.blocks) {
    const pageId = pageIds.get(block.pageSlug);
    if (!pageId) {
      summary.blocks.skipped += 1;
      continue;
    }

    const result = await upsertContentBlock({
      pageId,
      type: block.type,
      title: block.title,
      key: block.key,
      sortOrder: block.sortOrder,
      contentJson: block.contentJson,
    });
    summary.blocks[result] += 1;
    await sleep(50);
  }

  for (const blog of blogs) {
    const result = await upsertBlog(blog);
    summary.blogs[result] += 1;
    await sleep(50);
  }

  console.log("[sync-buildstack] completed", JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error("[sync-buildstack] failed", error);
  process.exitCode = 1;
});
