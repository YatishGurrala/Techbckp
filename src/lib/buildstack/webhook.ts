import { createHmac, timingSafeEqual } from "node:crypto";

import { getBuildstackConfig } from "./env";
import type { BuildstackWebhookEventType } from "./types";

const acceptedEvents: BuildstackWebhookEventType[] = [
  "page.published",
  "blog.published",
  "media.updated",
];

function toBufferHex(hex: string): Buffer | null {
  try {
    const normalized = hex.trim();
    const buffer = Buffer.from(normalized, "hex");
    return buffer.length > 0 ? buffer : null;
  } catch {
    return null;
  }
}

function normalizeSignature(input: string): string {
  const value = input.trim();
  if (value.startsWith("sha256=")) return value.slice(7);
  return value;
}

export function verifyBuildstackSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const { webhookSecret } = getBuildstackConfig();
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const provided = normalizeSignature(signatureHeader);

  const expectedBuffer = toBufferHex(expected);
  const providedBuffer = toBufferHex(provided);

  if (!expectedBuffer || !providedBuffer || expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function isSupportedBuildstackEvent(value: string): value is BuildstackWebhookEventType {
  return acceptedEvents.includes(value as BuildstackWebhookEventType);
}
