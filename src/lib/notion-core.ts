// Framework-agnostic Notion utilities.
// Ported from the Notionwebapp reference implementation.

type NotionRichText = { plain_text?: string };
type NotionProperty = {
  type?: string;
  rich_text?: NotionRichText[];
  title?: NotionRichText[];
  select?: { name?: string | null } | null;
  status?: { name?: string | null } | null;
  date?: { start?: string | null } | null;
  people?: Array<{ name?: string | null }>;
  number?: number | null;
  multi_select?: Array<{ name?: string | null }>;
  checkbox?: boolean;
  url?: string | null;
};

export type { NotionProperty };

export type NotionPageProperties = Record<string, NotionProperty>;

export type TestResult = {
  step: string;
  ok: boolean;
  message: string;
  data?: Record<string, unknown>;
};

export const NOTION_API_BASE = "https://api.notion.com/v1";
export const NOTION_API_VERSION = "2022-06-28";

export function extractText(prop: NotionProperty | undefined): string {
  if (!prop) return "";
  const arr = prop.rich_text ?? prop.title ?? [];
  return arr.map((rt) => rt.plain_text ?? "").join("").trim();
}

export function extractSlug(properties: NotionPageProperties): string {
  const slugKeys = ["Slug", "slug", "URL Slug", "url_slug", "Path", "path"];
  for (const key of slugKeys) {
    const value = extractText(properties[key]);
    if (value) return value;
  }
  return "";
}

export function extractStatus(properties: NotionPageProperties): string {
  const statusKeys = ["status", "Status", "state", "State"];
  for (const key of statusKeys) {
    const prop = properties[key];
    if (!prop) continue;

    const fromStatus = prop.status?.name?.trim();
    if (fromStatus) return fromStatus;

    const fromSelect = prop.select?.name?.trim();
    if (fromSelect) return fromSelect;

    const fromText = extractText(prop);
    if (fromText) return fromText;
  }
  return "";
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9_-]+$/i.test(slug) && slug.length < 200;
}

export function isPublishedStatus(status: string): boolean {
  return status.trim().toLowerCase() === "published";
}

export function extractPageId(body: Record<string, unknown>): string | null {
  const source = body.source as Record<string, unknown> | undefined;
  if (typeof source?.page_id === "string") return source.page_id;

  const data = body.data as Record<string, unknown> | undefined;
  if (typeof data?.id === "string") return data.id;

  if (typeof body.page_id === "string") return body.page_id;

  return null;
}

export function extractSlugFromWebhookBody(body: Record<string, unknown>): string {
  const candidates: string[] = [];

  const pushIfString = (value: unknown) => {
    if (typeof value === "string" && value.trim().length > 0) {
      candidates.push(value.trim());
    }
  };

  const readSlugCandidate = (obj: Record<string, unknown>) => {
    pushIfString(obj.slug);
    pushIfString(obj.Slug);
    pushIfString(obj.url_slug);
    pushIfString(obj["URL Slug"]);

    const slugObj = obj.slug as Record<string, unknown> | undefined;
    if (slugObj) {
      const richText = slugObj.rich_text as Array<{ plain_text?: string }> | undefined;
      pushIfString(richText?.map((item) => item.plain_text ?? "").join(""));
    }

    const slugObjCaps = obj.Slug as Record<string, unknown> | undefined;
    if (slugObjCaps) {
      const richText = slugObjCaps.rich_text as Array<{ plain_text?: string }> | undefined;
      pushIfString(richText?.map((item) => item.plain_text ?? "").join(""));
    }
  };

  readSlugCandidate(body);

  const source = body.source as Record<string, unknown> | undefined;
  if (source) readSlugCandidate(source);

  const data = body.data as Record<string, unknown> | undefined;
  if (data) {
    readSlugCandidate(data);
    const properties = data.properties as Record<string, unknown> | undefined;
    if (properties) readSlugCandidate(properties);
  }

  const firstValid = candidates.find((value) => isValidSlug(value));
  return firstValid ?? "";
}

export function extractStatusFromWebhookBody(body: Record<string, unknown>): string {
  const candidates: string[] = [];

  const pushIfString = (value: unknown) => {
    if (typeof value === "string" && value.trim().length > 0) {
      candidates.push(value.trim());
    }
  };

  const readStatusCandidate = (obj: Record<string, unknown>) => {
    pushIfString(obj.status);
    pushIfString(obj.Status);
    pushIfString(obj.state);

    const statusObj = obj.status as Record<string, unknown> | undefined;
    if (statusObj) {
      pushIfString(statusObj.name);
      const selectName = (statusObj.select as Record<string, unknown> | undefined)?.name;
      pushIfString(selectName);
      const richText = statusObj.rich_text as Array<{ plain_text?: string }> | undefined;
      pushIfString(richText?.map((item) => item.plain_text ?? "").join(""));
    }
  };

  readStatusCandidate(body);

  const source = body.source as Record<string, unknown> | undefined;
  if (source) readStatusCandidate(source);

  const data = body.data as Record<string, unknown> | undefined;
  if (data) {
    readStatusCandidate(data);
    const properties = data.properties as Record<string, unknown> | undefined;
    if (properties) readStatusCandidate(properties);
  }

  return candidates[0] ?? "";
}

export async function fetchNotionPage(
  pageId: string,
  notionApiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<NotionPageProperties | null> {
  try {
    const notionResponse = await fetchImpl(`${NOTION_API_BASE}/pages/${pageId}`, {
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        "Notion-Version": NOTION_API_VERSION,
      },
    });

    if (!notionResponse.ok) return null;

    const data = (await notionResponse.json()) as { properties?: NotionPageProperties };
    return data.properties ?? null;
  } catch {
    return null;
  }
}

export async function queryNotionDatabase(
  databaseId: string,
  notionApiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  try {
    const response = await fetchImpl(`${NOTION_API_BASE}/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        "Notion-Version": NOTION_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 1 }),
    });

    if (response.status === 401) {
      return { ok: false, error: "Invalid Notion API key (401 Unauthorized)" };
    }
    if (response.status === 404) {
      return { ok: false, error: "Database not found - check the Database ID (404)" };
    }
    if (response.status === 403) {
      return {
        ok: false,
        error: "Integration not connected to this database (403 Forbidden)",
      };
    }
    if (!response.ok) {
      return { ok: false, error: `Notion API error: ${response.status}` };
    }

    const data = (await response.json()) as { results?: unknown[] };
    return { ok: true, count: data.results?.length ?? 0 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown fetch error" };
  }
}

export async function runNotionConnectionTest(input: {
  notionApiKey: string;
  databaseId: string;
  pageId?: string;
  revalidateUrl?: string;
  revalidateSecret?: string;
  fetchImpl?: typeof fetch;
}): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const fetchImpl = input.fetchImpl ?? fetch;

  if (
    !input.notionApiKey ||
    (!input.notionApiKey.startsWith("ntn_") && !input.notionApiKey.startsWith("secret_"))
  ) {
    results.push({
      step: "validate_key",
      ok: false,
      message: "API key looks invalid - should start with ntn_ or secret_",
    });
    return results;
  }

  results.push({ step: "validate_key", ok: true, message: "API key format looks valid" });

  if (!input.databaseId || input.databaseId.replace(/-/g, "").length !== 32) {
    results.push({
      step: "validate_db",
      ok: false,
      message: "Database ID should be a 32-character hex string (with or without dashes)",
    });
    return results;
  }

  results.push({ step: "validate_db", ok: true, message: "Database ID format looks valid" });

  const dbResult = await queryNotionDatabase(input.databaseId, input.notionApiKey, fetchImpl);
  if (!dbResult.ok) {
    results.push({
      step: "query_database",
      ok: false,
      message: dbResult.error ?? "Failed to query database",
    });
    return results;
  }

  results.push({
    step: "query_database",
    ok: true,
    message: `Connected to database - found ${dbResult.count ?? 0} page(s) in first query`,
  });

  if (input.pageId) {
    const properties = await fetchNotionPage(input.pageId, input.notionApiKey, fetchImpl);
    if (!properties) {
      results.push({
        step: "fetch_page",
        ok: false,
        message: "Could not fetch page - check the Page ID and integration access",
      });
    } else {
      const slug = extractSlug(properties);
      const status = extractStatus(properties);
      results.push({
        step: "fetch_page",
        ok: true,
        message: "Page fetched successfully",
        data: { slug: slug || "(not found)", status: status || "(not found)" },
      });

      if (status && !isPublishedStatus(status)) {
        results.push({
          step: "check_status",
          ok: false,
          message: `Status is "${status}" - only pages with Status = "Published" will be revalidated`,
        });
      } else if (status) {
        results.push({
          step: "check_status",
          ok: true,
          message: `Status is "${status}" - page would be revalidated`,
        });
      }
    }
  }

  if (input.revalidateUrl) {
    try {
      const pingUrl = input.revalidateUrl.endsWith("/")
        ? input.revalidateUrl.slice(0, -1)
        : input.revalidateUrl;

      const response = await fetchImpl(`${pingUrl}/api/notion-publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-notion-secret": input.revalidateSecret ?? "",
        },
        body: JSON.stringify({ test: true }),
      });

      const isAuth = response.status === 401;
      results.push({
        step: "ping_revalidate",
        ok: isAuth || response.ok,
        message: isAuth
          ? "Revalidate endpoint reachable - returned 401 (expected without valid secret)"
          : response.ok
            ? `Revalidate endpoint returned ${response.status}`
            : `Revalidate endpoint returned ${response.status} - check the URL`,
      });
    } catch {
      results.push({
        step: "ping_revalidate",
        ok: false,
        message:
          "Could not reach the revalidate URL - check it is deployed and publicly accessible",
      });
    }
  }

  return results;
}
