import type { ContactAttribution, ContactSubmissionInput } from "@/lib/contact";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const SCHEMA_CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

export type NotionLeadRecord = {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  submittedAt: string;
  source: string;
  attribution: ContactAttribution;
};

export type NotionPropertySchema = Record<string, { type: string }>;

type CachedSchema = {
  dbId: string;
  properties: NotionPropertySchema;
  expiresAt: number;
};

let cachedSchema: CachedSchema | null = null;

export function resetNotionSchemaCacheForTests() {
  cachedSchema = null;
}

export function normalizeNotionDatabaseId(raw: string | undefined | null): string | null {
  const cleaned = String(raw ?? "").trim().replace(/-/g, "");
  if (!/^[a-f0-9]{32}$/i.test(cleaned)) {
    return null;
  }
  return [
    cleaned.slice(0, 8),
    cleaned.slice(8, 12),
    cleaned.slice(12, 16),
    cleaned.slice(16, 20),
    cleaned.slice(20),
  ]
    .join("-")
    .toLowerCase();
}

export function isNotionLeadsConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const apiKey = String(env.NOTION_API_KEY ?? "").trim();
  const dbId = normalizeNotionDatabaseId(env.NOTION_LEADS_DB_ID);
  return Boolean(apiKey && dbId);
}

function toRichText(value: string) {
  const chunks: Array<{ type: "text"; text: { content: string } }> = [];
  const maxChunk = 1900;
  for (let i = 0; i < value.length; i += maxChunk) {
    chunks.push({
      type: "text",
      text: { content: value.slice(i, i + maxChunk) },
    });
  }
  return chunks.length > 0 ? chunks : [{ type: "text" as const, text: { content: "" } }];
}

function findMatchingProperty(
  schema: NotionPropertySchema,
  aliases: string[],
  allowedTypes: string[],
): { name: string; type: string } | null {
  const entries = Object.entries(schema);
  for (const alias of aliases) {
    const target = alias.toLowerCase();
    const match = entries.find(
      ([propName, prop]) =>
        propName.toLowerCase() === target && allowedTypes.includes(prop.type),
    );
    if (match) {
      return { name: match[0], type: match[1].type };
    }
  }
  return null;
}

function setTypedProperty(
  target: Record<string, unknown>,
  match: { name: string; type: string } | null,
  value: string | undefined,
) {
  if (!match || !value || !value.trim()) return;
  const trimmed = value.trim();

  switch (match.type) {
    case "title":
      target[match.name] = { title: toRichText(trimmed.slice(0, 200)) };
      break;
    case "email":
      target[match.name] = { email: trimmed };
      break;
    case "rich_text":
      target[match.name] = { rich_text: toRichText(trimmed) };
      break;
    case "select":
      target[match.name] = { select: { name: trimmed.slice(0, 100).replace(/,/g, " ") } };
      break;
    case "status":
      target[match.name] = { status: { name: trimmed } };
      break;
    case "date":
      target[match.name] = { date: { start: trimmed } };
      break;
    case "url":
      if (/^https?:\/\//i.test(trimmed)) {
        target[match.name] = { url: trimmed };
      }
      break;
  }
}

export function buildNotionLeadProperties(
  schema: NotionPropertySchema,
  lead: NotionLeadRecord,
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  // Every Notion database has exactly one title property.
  const titleProp =
    findMatchingProperty(schema, ["Name", "Full Name", "Lead", "Title", "Project", "Inquiry"], ["title"]) ??
    (() => {
      const entry = Object.entries(schema).find(([, prop]) => prop.type === "title");
      return entry ? { name: entry[0], type: "title" } : null;
    })();

  const titleValue = lead.company
    ? `${lead.name} — ${lead.company} (${lead.service})`
    : `${lead.name} (${lead.service})`;
  setTypedProperty(properties, titleProp, titleValue);

  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["Email", "Email Address", "Contact Email"], ["email", "rich_text"]),
    lead.email,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["Company", "Organization", "Business"], ["rich_text", "select"]),
    lead.company,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["Service", "Service Needed", "Project Type", "Category"], ["select", "rich_text"]),
    lead.service,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["Budget", "Budget Range", "Estimated Budget"], ["select", "rich_text"]),
    lead.budget,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["Timeline", "Preferred Timeline"], ["select", "rich_text"]),
    lead.timeline,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["Message", "Details", "Brief", "Project Details", "Notes"], ["rich_text"]),
    lead.message,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["Source", "Lead Source", "Origin"], ["select", "rich_text"]),
    lead.source,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["UTM Source", "utm_source"], ["select", "rich_text"]),
    lead.attribution.utmSource,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["UTM Medium", "utm_medium"], ["select", "rich_text"]),
    lead.attribution.utmMedium,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["UTM Campaign", "utm_campaign"], ["select", "rich_text"]),
    lead.attribution.utmCampaign,
  );
  setTypedProperty(
    properties,
    findMatchingProperty(schema, ["Submitted At", "Submitted", "Date", "Created"], ["date"]),
    lead.submittedAt,
  );

  return properties;
}

export function buildNotionLeadBlocks(lead: NotionLeadRecord) {
  const summaryLines = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.company ? `Company: ${lead.company}` : null,
    `Service: ${lead.service}`,
    `Budget: ${lead.budget}`,
    `Timeline: ${lead.timeline}`,
    `Source: ${lead.source}`,
    lead.attribution.referrerPath ? `Referrer Path: ${lead.attribution.referrerPath}` : null,
    lead.attribution.utmSource ? `UTM Source: ${lead.attribution.utmSource}` : null,
    lead.attribution.utmMedium ? `UTM Medium: ${lead.attribution.utmMedium}` : null,
    lead.attribution.utmCampaign ? `UTM Campaign: ${lead.attribution.utmCampaign}` : null,
    lead.attribution.utmContent ? `UTM Content: ${lead.attribution.utmContent}` : null,
    lead.attribution.utmTerm ? `UTM Term: ${lead.attribution.utmTerm}` : null,
    lead.attribution.toolSummary ? `Tool / Estimate Summary: ${lead.attribution.toolSummary}` : null,
    `Submitted At: ${lead.submittedAt}`,
  ].filter((line): line is string => Boolean(line));

  return [
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: toRichText("Project Inquiry Summary") },
    },
    ...summaryLines.map((line) => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: toRichText(line) },
    })),
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: toRichText("Project Brief") },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: toRichText(lead.message) },
    },
  ];
}

async function fetchDatabaseSchema(
  dbId: string,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<NotionPropertySchema> {
  const now = Date.now();
  if (cachedSchema && cachedSchema.dbId === dbId && cachedSchema.expiresAt > now) {
    return cachedSchema.properties;
  }

  const response = await fetchImpl(`${NOTION_API_BASE}/databases/${dbId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": NOTION_VERSION,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Notion database lookup failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    properties?: Record<string, { type?: string }>;
  };

  const properties: NotionPropertySchema = {};
  for (const [key, value] of Object.entries(data.properties ?? {})) {
    if (value && typeof value.type === "string") {
      properties[key] = { type: value.type };
    }
  }

  cachedSchema = {
    dbId,
    properties,
    expiresAt: now + SCHEMA_CACHE_TTL_MS,
  };

  return properties;
}

export async function createNotionLead(
  input: ContactSubmissionInput & { submittedAt: string; source: string },
  options?: {
    env?: Record<string, string | undefined>;
    fetchImpl?: typeof fetch;
  },
): Promise<{ pageId: string }> {
  const env = options?.env ?? process.env;
  const fetchImpl = options?.fetchImpl ?? fetch;

  const apiKey = String(env.NOTION_API_KEY ?? "").trim();
  const dbId = normalizeNotionDatabaseId(env.NOTION_LEADS_DB_ID);

  if (!apiKey || !dbId) {
    throw new Error("Notion leads integration is not configured.");
  }

  const lead: NotionLeadRecord = {
    name: input.name,
    email: input.email,
    company: input.company || undefined,
    service: input.service,
    budget: input.budget,
    timeline: input.timeline,
    message: input.message,
    submittedAt: input.submittedAt,
    source: input.source,
    attribution: input.attribution ?? {},
  };

  const schema = await fetchDatabaseSchema(dbId, apiKey, fetchImpl);
  const properties = buildNotionLeadProperties(schema, lead);
  const children = buildNotionLeadBlocks(lead);

  const response = await fetchImpl(`${NOTION_API_BASE}/pages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties,
      children,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Notion lead creation failed with status ${response.status}`);
  }

  const created = (await response.json()) as { id?: string };
  if (!created?.id) {
    throw new Error("Notion lead creation returned no page id");
  }

  return { pageId: created.id };
}

