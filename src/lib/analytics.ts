// Server-side analytics (best-effort GA4 Measurement Protocol).
// Ported from the Notionwebapp reference implementation.

export type AnalyticsEventName =
  | "notion_test_started"
  | "notion_test_succeeded"
  | "notion_test_failed"
  | "notion_test_invalid_input"
  | "notion_test_internal_error"
  | "notion_publish_received"
  | "notion_publish_revalidated"
  | "notion_publish_skipped"
  | "notion_publish_unauthorized"
  | "notion_publish_verification"
  | "notion_publish_failed"
  | "contact_form_invalid_input"
  | "contact_form_submitted"
  | "contact_form_webhook_failed";

export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsEnv = {
  measurementId?: string;
  apiSecret?: string;
};

export async function trackAnalyticsEvent(input: {
  eventName: AnalyticsEventName;
  params?: AnalyticsParams;
  env: AnalyticsEnv;
  fetchImpl?: typeof fetch;
  logInfo?: (message: string, meta: Record<string, unknown>) => void;
}): Promise<void> {
  const logInfo = input.logInfo ?? ((message, meta) => console.info(message, meta));
  const fetchImpl = input.fetchImpl ?? fetch;

  logInfo("[techbckp] analytics_event", {
    eventName: input.eventName,
    ...input.params,
  });

  if (!input.env.measurementId || !input.env.apiSecret) {
    return;
  }

  try {
    await fetchImpl(
      `https://www.google-analytics.com/mp/collect?measurement_id=${input.env.measurementId}&api_secret=${input.env.apiSecret}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "server.techbckp",
          events: [
            {
              name: input.eventName,
              params: input.params ?? {},
            },
          ],
        }),
      },
    );
  } catch {
    // Best effort analytics only.
  }
}
