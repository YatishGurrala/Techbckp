export const SERVICE_OPTIONS = [
  "MVP development",
  "Mobile app development",
  "SaaS development",
  "AI automation and integrations",
  "AI chatbot development",
  "Website development",
  "Content systems",
  "Technical advisory",
  "Other",
] as const;

export const BUDGET_OPTIONS = [
  "Under $2k",
  "$2k - $5k",
  "$5k - $10k",
  "$10k+",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = [
  "ASAP",
  "2-4 weeks",
  "1-2 months",
  "3+ months",
  "Flexible",
] as const;

const SERVICE_SLUG_MAP: Record<string, (typeof SERVICE_OPTIONS)[number]> = {
  mvp: "MVP development",
  "mvp-development": "MVP development",
  "mvp-launch-system": "MVP development",
  mobile: "Mobile app development",
  "mobile-app-development": "Mobile app development",
  saas: "SaaS development",
  "saas-development": "SaaS development",
  automation: "AI automation and integrations",
  "ai-automation": "AI automation and integrations",
  "business-automation-setup": "AI automation and integrations",
  chatbot: "AI chatbot development",
  "ai-chatbot-development": "AI chatbot development",
  web: "Website development",
  "web-development": "Website development",
  "conversion-website-setup": "Website development",
  content: "Content systems",
  "content-systems": "Content systems",
  "content-growth-system": "Content systems",
  advisory: "Technical advisory",
  "technical-advisory": "Technical advisory",
};

export function normalizeServiceSelection(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const exact = SERVICE_OPTIONS.find(
    (option) => option.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) return exact;

  const slugKey = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return SERVICE_SLUG_MAP[slugKey] ?? "";
}

export function normalizeOptionSelection<T extends readonly string[]>(
  raw: string | null | undefined,
  options: T,
): string {
  if (!raw) return "";
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return "";
  return options.find((opt) => opt.toLowerCase() === trimmed) ?? "";
}

export type ProjectBriefDraft = {
  name?: string;
  company?: string;
  service: string;
  budget: string;
  timeline: string;
  estimate?: string;
  details: string;
};

export function buildProjectBriefSubject(draft: Pick<ProjectBriefDraft, "service" | "company">): string {
  const servicePart = draft.service ? draft.service : "New Project";
  const companyPart = draft.company?.trim() ? ` — ${draft.company.trim()}` : "";
  return `Techbckp Project Inquiry: ${servicePart}${companyPart}`;
}

export function buildProjectBriefText(draft: ProjectBriefDraft): string {
  const lines = [
    "Hi Techbckp team,",
    "",
    "Here is my project brief:",
    draft.name?.trim() ? `Name: ${draft.name.trim()}` : null,
    draft.company?.trim() ? `Company: ${draft.company.trim()}` : null,
    draft.service ? `Service needed: ${draft.service}` : null,
    draft.budget ? `Budget range: ${draft.budget}` : null,
    draft.timeline ? `Preferred timeline: ${draft.timeline}` : null,
    draft.estimate?.trim() ? `Estimated scope: ${draft.estimate.trim()}` : null,
    "",
    "Project goals & requirements:",
    draft.details.trim() || "(Describe what you're looking to build or automate)",
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}

export function buildPrefilledMailto(email: string, draft: ProjectBriefDraft): string {
  const subject = encodeURIComponent(buildProjectBriefSubject(draft));
  const body = encodeURIComponent(buildProjectBriefText(draft));
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function buildPrefilledGmailUrl(email: string, draft: ProjectBriefDraft): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: buildProjectBriefSubject(draft),
    body: buildProjectBriefText(draft),
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
