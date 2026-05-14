import type { BuildstackConfig } from "./types";

function readEnv(name: keyof NodeJS.ProcessEnv): string {
  return String(process.env[name] ?? "").trim();
}

function required(name: keyof NodeJS.ProcessEnv): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`[buildstack] Missing required environment variable: ${name}`);
  }
  return value;
}

let cachedConfig: BuildstackConfig | null = null;

export function getBuildstackConfig(): BuildstackConfig {
  if (cachedConfig) return cachedConfig;

  const baseUrl = required("BUILDSTACK_CMS_BASE_URL").replace(/\/$/, "");
  const projectSlug = required("BUILDSTACK_PROJECT_SLUG");
  const projectId = required("BUILDSTACK_PROJECT_ID");
  const adminApiKey = required("BUILDSTACK_ADMIN_API_KEY");
  const webhookSecret = required("BUILDSTACK_WEBHOOK_SECRET");

  try {
    new URL(baseUrl);
  } catch {
    throw new Error("[buildstack] BUILDSTACK_CMS_BASE_URL must be a valid absolute URL");
  }

  cachedConfig = {
    baseUrl,
    projectSlug,
    projectId,
    adminApiKey,
    webhookSecret,
  };

  return cachedConfig;
}

export function resetBuildstackConfigForTests() {
  cachedConfig = null;
}
