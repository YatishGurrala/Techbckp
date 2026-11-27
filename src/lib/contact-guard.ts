import { createHash } from "node:crypto";

// NOTE: These guards use process-local in-memory state. They protect against rapid
// bursts and double-clicks hitting the same warm serverless instance, but are NOT
// shared across multiple Vercel serverless instances or cold starts.

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_TRACKED_KEYS = 2_000;

const ipBuckets = new Map<string, number[]>();
const recentSubmissionHashes = new Map<string, number>();
const inFlightFingerprints = new Set<string>();

function pruneExpired(now: number) {
  if (ipBuckets.size > MAX_TRACKED_KEYS) {
    for (const [key, timestamps] of ipBuckets.entries()) {
      const fresh = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (fresh.length === 0) {
        ipBuckets.delete(key);
      } else {
        ipBuckets.set(key, fresh);
      }
    }
  }

  if (recentSubmissionHashes.size > MAX_TRACKED_KEYS) {
    for (const [hash, expiresAt] of recentSubmissionHashes.entries()) {
      if (expiresAt <= now) {
        recentSubmissionHashes.delete(hash);
      }
    }
  }
}

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

export function checkContactRateLimit(
  clientKey: string,
  now = Date.now(),
): { allowed: boolean; retryAfterSeconds: number } {
  pruneExpired(now);
  // Hash client IP so no raw IP addresses sit in memory.
  const bucketKey = createHash("sha256").update(clientKey).digest("hex").slice(0, 24);
  const existing = (ipBuckets.get(bucketKey) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  );

  if (existing.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = existing[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000),
    );
    ipBuckets.set(bucketKey, existing);
    return { allowed: false, retryAfterSeconds };
  }

  existing.push(now);
  ipBuckets.set(bucketKey, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function computeSubmissionFingerprint(input: {
  email: string;
  service: string;
  message: string;
}): string {
  const normalized = [
    input.email.trim().toLowerCase(),
    input.service.trim().toLowerCase(),
    input.message.trim().replace(/\s+/g, " ").toLowerCase(),
  ].join("|");
  return createHash("sha256").update(normalized).digest("hex");
}

export function isDuplicateSubmission(fingerprint: string, now = Date.now()): boolean {
  if (inFlightFingerprints.has(fingerprint)) return true;

  const expiresAt = recentSubmissionHashes.get(fingerprint);
  if (!expiresAt) return false;
  if (expiresAt <= now) {
    recentSubmissionHashes.delete(fingerprint);
    return false;
  }
  return true;
}

export function acquireSubmissionLock(fingerprint: string, now = Date.now()): boolean {
  if (isDuplicateSubmission(fingerprint, now)) {
    return false;
  }
  inFlightFingerprints.add(fingerprint);
  return true;
}

export function releaseSubmissionLock(fingerprint: string): void {
  inFlightFingerprints.delete(fingerprint);
}

export function recordAcceptedSubmission(fingerprint: string, now = Date.now()): void {
  pruneExpired(now);
  recentSubmissionHashes.set(fingerprint, now + DUPLICATE_WINDOW_MS);
}

export function resetContactGuardsForTests(): void {
  ipBuckets.clear();
  recentSubmissionHashes.clear();
  inFlightFingerprints.clear();
}
