import {
  getHomepageAudiences,
  getHomepagePricing,
  getHomepageProcessSteps,
  getHomepageQualification,
  getHomepageServices,
} from "./buildstack/content";
import { getPublicContentBlock } from "./buildstack/public-client";
import {
  audiences as fallbackAudiences,
  navItems as fallbackNav,
  processSteps as fallbackProcess,
  qualification as fallbackQualification,
  services as fallbackServices,
} from "./site-data";

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
export type NotionPageHtml = { title: string; contentHtml: string };

export type PageKey = "hero" | "about" | "cta" | "footer" | "contact" | "privacy" | "terms";

const pageBlockKeyMap: Record<PageKey, string> = {
  hero: "home-hero",
  about: "about-page",
  cta: "global-cta",
  footer: "global-footer",
  contact: "contact-page",
  privacy: "privacy-policy",
  terms: "terms-of-service",
};

function toFallbackPage(key: PageKey): NotionPageHtml | null {
  if (key === "privacy") {
    return {
      title: "Privacy Policy",
      contentHtml:
        "<p>Privacy policy content is being updated. For questions, email <a href=\"mailto:contact@techbckp.com\">contact@techbckp.com</a>.</p>",
    };
  }

  if (key === "terms") {
    return {
      title: "Terms of Service",
      contentHtml:
        "<p>Terms of service content is being updated. For questions, email <a href=\"mailto:contact@techbckp.com\">contact@techbckp.com</a>.</p>",
    };
  }

  return null;
}

export async function getNav(): Promise<NavItem[]> {
  return fallbackNav;
}

export async function getServices(): Promise<Service[]> {
  try {
    const services = await getHomepageServices();
    return services.length > 0 ? services : fallbackServices;
  } catch {
    return fallbackServices;
  }
}

export async function getPricing(): Promise<PricingTier[]> {
  try {
    return await getHomepagePricing();
  } catch {
    return fallbackServices.map((service) => ({
      name: service.name,
      price: service.price,
      tagline: service.description,
      features: service.includes,
      ctaLabel: "Start Project",
      ctaHref: "/contact",
      featured: service.featured,
    }));
  }
}

export async function getAudiences(): Promise<Audience[]> {
  try {
    const audiences = await getHomepageAudiences();
    return audiences.length > 0 ? audiences : fallbackAudiences;
  } catch {
    return fallbackAudiences;
  }
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  try {
    const steps = await getHomepageProcessSteps();
    return steps.length > 0 ? steps : fallbackProcess;
  } catch {
    return fallbackProcess;
  }
}

export async function getQualification(): Promise<Qualification> {
  try {
    return await getHomepageQualification();
  } catch {
    return fallbackQualification;
  }
}

export async function getPage(key: PageKey): Promise<NotionPageHtml | null> {
  try {
    const block = await getPublicContentBlock(pageBlockKeyMap[key]);
    if (!block.ok || !block.data) return toFallbackPage(key);

    if (block.data.contentHtml) {
      return {
        title: block.data.title || key,
        contentHtml: block.data.contentHtml,
      };
    }

    if (typeof block.data.body === "string" && block.data.body.trim()) {
      return {
        title: block.data.title || key,
        contentHtml: `<p>${block.data.body}</p>`,
      };
    }

    return toFallbackPage(key);
  } catch {
    return toFallbackPage(key);
  }
}
