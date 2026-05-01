import { NextResponse, type NextRequest } from "next/server";

import { trackAnalyticsEvent } from "@/lib/analytics";
import { runNotionConnectionTest } from "@/lib/notion-core";

// Diagnostic endpoint: validates Notion credentials, database access, and the
// publish webhook reachability. Mirrors the Notionwebapp test console.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  const analyticsEnv = {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    apiSecret: process.env.GA_API_SECRET,
  };

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    await trackAnalyticsEvent({
      eventName: "notion_test_invalid_input",
      params: { reason: "invalid_json" },
      env: analyticsEnv,
    });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const notionApiKey =
    typeof body.notionApiKey === "string" ? body.notionApiKey.trim() : "";
  const databaseId = typeof body.databaseId === "string" ? body.databaseId.trim() : "";
  const pageId = typeof body.pageId === "string" ? body.pageId.trim() : undefined;
  const revalidateUrl =
    typeof body.revalidateUrl === "string" ? body.revalidateUrl.trim() : undefined;
  const revalidateSecret =
    typeof body.revalidateSecret === "string" ? body.revalidateSecret.trim() : undefined;

  if (!notionApiKey || !databaseId) {
    await trackAnalyticsEvent({
      eventName: "notion_test_invalid_input",
      params: {
        reason: "missing_required_fields",
        hasApiKey: Boolean(notionApiKey),
        hasDatabaseId: Boolean(databaseId),
      },
      env: analyticsEnv,
    });
    return NextResponse.json(
      { error: "notionApiKey and databaseId are required" },
      { status: 400 },
    );
  }

  if (revalidateUrl) {
    try {
      new URL(revalidateUrl);
    } catch {
      await trackAnalyticsEvent({
        eventName: "notion_test_invalid_input",
        params: { reason: "invalid_revalidate_url" },
        env: analyticsEnv,
      });
      return NextResponse.json(
        { error: "revalidateUrl must be a valid absolute URL" },
        { status: 400 },
      );
    }
  }

  await trackAnalyticsEvent({
    eventName: "notion_test_started",
    params: {
      hasPageId: Boolean(pageId),
      hasRevalidateUrl: Boolean(revalidateUrl),
    },
    env: analyticsEnv,
  });

  try {
    const results = await runNotionConnectionTest({
      notionApiKey,
      databaseId,
      pageId: pageId || undefined,
      revalidateUrl: revalidateUrl || undefined,
      revalidateSecret: revalidateSecret || undefined,
    });

    const allOk = results.every((r) => r.ok);

    await trackAnalyticsEvent({
      eventName: allOk ? "notion_test_succeeded" : "notion_test_failed",
      params: {
        allOk,
        checksRun: results.length,
        checksFailed: results.filter((r) => !r.ok).length,
      },
      env: analyticsEnv,
    });

    return NextResponse.json({ results, allOk }, { status: 200 });
  } catch (error) {
    await trackAnalyticsEvent({
      eventName: "notion_test_internal_error",
      params: {
        message: error instanceof Error ? error.message : "unknown_error",
      },
      env: analyticsEnv,
    });
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
