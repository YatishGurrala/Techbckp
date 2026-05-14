import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { resetBuildstackConfigForTests } from "./env";
import { isSupportedBuildstackEvent, verifyBuildstackSignature } from "./webhook";

const REQUIRED_ENV = {
  BUILDSTACK_CMS_BASE_URL: "https://cms.builddeck.io",
  BUILDSTACK_PROJECT_SLUG: "project-slug",
  BUILDSTACK_PROJECT_ID: "project-id",
  BUILDSTACK_ADMIN_API_KEY: "admin-key",
  BUILDSTACK_WEBHOOK_SECRET: "webhook-secret",
} as const;

function setRequiredEnv() {
  for (const [key, value] of Object.entries(REQUIRED_ENV)) {
    process.env[key] = value;
  }
}

afterEach(() => {
  resetBuildstackConfigForTests();
});

describe("buildstack webhook signature verification", () => {
  it("returns true for valid hmac signature", () => {
    setRequiredEnv();

    const rawBody = JSON.stringify({ type: "page.published", slug: "home" });
    const signature = createHmac("sha256", REQUIRED_ENV.BUILDSTACK_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    expect(verifyBuildstackSignature(rawBody, signature)).toBe(true);
  });

  it("returns false for invalid signature", () => {
    setRequiredEnv();

    const rawBody = JSON.stringify({ type: "blog.published", slug: "test" });

    expect(verifyBuildstackSignature(rawBody, "deadbeef")).toBe(false);
  });

  it("accepts only expected webhook events", () => {
    expect(isSupportedBuildstackEvent("page.published")).toBe(true);
    expect(isSupportedBuildstackEvent("blog.published")).toBe(true);
    expect(isSupportedBuildstackEvent("media.updated")).toBe(true);
    expect(isSupportedBuildstackEvent("page.deleted")).toBe(false);
  });
});
