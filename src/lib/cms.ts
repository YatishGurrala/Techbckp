// High-level CMS loaders. Pages call these from server components.
// Each loader pulls from Notion when configured, falling back to the static
// values in src/lib/site-data.ts so the site keeps building/rendering even
// without env vars or when Notion is briefly unavailable.

import {
  audiences as fallbackAudiences,
  externalLinks,
  navItems as fallbackNav,
  processSteps as fallbackProcess,
  qualification as fallbackQualification,
  services as fallbackServices,
} from "./site-data";
import {
  getCollection,
  getPageHtmlById,
  isCollectionsConfigured,
  type CollectionRow,
  type NotionPageHtml,
} from "./notion-cms";

export type NavItem = { label: string; href: string };
export type Service = {
  name: string;
  price: string;
  duration: string;
  description: string;
  includes: string[];
  featured?: boolean;
};
export type PricingTier = {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};
export type Audience = { title: string; body: string };
export type ProcessStep = { title: string; subtitle: string; description: string };
export type Qualification = { goodFit: string[]; notFit: string[] };

function rowToService(row: CollectionRow): Service {
  return {
    name: row.name,
    price: row.price || "Custom",
    duration: row.duration || "",
    description: row.description,
    includes: row.items,
    featured: row.featured,
  };
}

function rowToPricingTier(row: CollectionRow): PricingTier {
  return {
    name: row.name,
    price: row.price || "Custom",
    tagline: row.subtitle || row.description,
    features: row.items,
    ctaLabel: row.ctaLabel || "Get Started",
    ctaHref: row.href || externalLinks.calendly,
    featured: row.featured,
  };
}

function rowToAudience(row: CollectionRow): Audience {
  return { title: row.name, body: row.description };
}

function rowToProcess(row: CollectionRow): ProcessStep {
  return { title: row.name, subtitle: row.subtitle, description: row.description };
}

function rowToNav(row: CollectionRow): NavItem | null {
  if (!row.href) return null;
  return { label: row.name, href: row.href };
}

async function safeCollection(name: Parameters<typeof getCollection>[0]) {
  if (!isCollectionsConfigured()) return [] as CollectionRow[];
  try {
    return await getCollection(name);
  } catch (err) {
    console.warn(`[cms] getCollection(${name}) failed`, err);
    return [] as CollectionRow[];
  }
}

export async function getNav(): Promise<NavItem[]> {
  const rows = await safeCollection("nav");
  if (rows.length === 0) return fallbackNav;
  return rows.map(rowToNav).filter((item): item is NavItem => item !== null);
}

export async function getServices(): Promise<Service[]> {
  const rows = await safeCollection("service");
  if (rows.length === 0) return fallbackServices;
  return rows.map(rowToService);
}

export async function getPricing(): Promise<PricingTier[]> {
  const rows = await safeCollection("pricing");
  if (rows.length === 0) {
    // Fallback to services as tiers if no dedicated pricing rows exist yet.
    return fallbackServices.map((s) => ({
      name: s.name,
      price: s.price,
      tagline: s.description,
      features: s.includes,
      ctaLabel: "Start Project",
      ctaHref: externalLinks.stripe,
      featured: s.featured,
    }));
  }
  return rows.map(rowToPricingTier);
}

export async function getAudiences(): Promise<Audience[]> {
  const rows = await safeCollection("audience");
  if (rows.length === 0) return fallbackAudiences;
  return rows.map(rowToAudience);
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  const rows = await safeCollection("process");
  if (rows.length === 0) return fallbackProcess;
  return rows.map(rowToProcess);
}

export async function getQualification(): Promise<Qualification> {
  const rows = await safeCollection("qualification");
  if (rows.length === 0) return fallbackQualification;
  const goodFit = rows
    .filter((r) => r.bucket?.toLowerCase().startsWith("good"))
    .map((r) => r.name);
  const notFit = rows
    .filter((r) => !r.bucket?.toLowerCase().startsWith("good"))
    .map((r) => r.name);
  return {
    goodFit: goodFit.length > 0 ? goodFit : fallbackQualification.goodFit,
    notFit: notFit.length > 0 ? notFit : fallbackQualification.notFit,
  };
}

// ---------------------------------------------------------------------------
// Free-form prose pages
// ---------------------------------------------------------------------------

export type PageKey = "hero" | "about" | "cta" | "footer" | "contact" | "privacy" | "terms";

const PAGE_ENV_MAP: Record<PageKey, string> = {
  hero: "NOTION_PAGE_HERO",
  about: "NOTION_PAGE_ABOUT",
  cta: "NOTION_PAGE_CTA",
  footer: "NOTION_PAGE_FOOTER",
  contact: "NOTION_PAGE_CONTACT",
  privacy: "NOTION_PAGE_PRIVACY",
  terms: "NOTION_PAGE_TERMS",
};

export async function getPage(key: PageKey): Promise<NotionPageHtml | null> {
  const id = process.env[PAGE_ENV_MAP[key]];
  if (!id) return null;
  try {
    return await getPageHtmlById(id);
  } catch (err) {
    console.warn(`[cms] getPage(${key}) failed`, err);
    return null;
  }
}
