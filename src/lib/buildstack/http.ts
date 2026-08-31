import type { CmsError, CmsResult } from "./types";

type HttpOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  fetchImpl?: typeof fetch;
};

const DEFAULT_TIMEOUT_MS = 2_000;
const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mapHttpError(status: number, details?: unknown): CmsError {
  return {
    code: "http",
    status,
    message: `[buildstack] Request failed with status ${status}`,
    details,
  };
}

function mapNetworkError(cause: unknown): CmsError {
  return {
    code: "network",
    message: "[buildstack] Network request failed",
    cause,
  };
}

function mapTimeoutError(timeoutMs: number): CmsError {
  return {
    code: "timeout",
    message: `[buildstack] Request timed out after ${timeoutMs}ms`,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export async function fetchWithTimeoutRetry(
  input: string,
  init: RequestInit,
  options: HttpOptions = {},
): Promise<CmsResult<Response>> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  let lastError: CmsError | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(input, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status >= 500 && attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        let details: unknown;
        try {
          details = await response.clone().json();
        } catch {
          details = await response.clone().text().catch(() => undefined);
        }
        return { ok: false, error: mapHttpError(response.status, details) };
      }

      return { ok: true, data: response, status: response.status };
    } catch (error) {
      clearTimeout(timeout);

      if (isAbortError(error)) {
        lastError = mapTimeoutError(timeoutMs);
      } else {
        lastError = mapNetworkError(error);
      }

      if (attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }
    }
  }

  return {
    ok: false,
    error: lastError ?? {
      code: "network",
      message: "[buildstack] Request failed",
    },
  };
}

export async function parseJson<T>(response: Response): Promise<CmsResult<T>> {
  try {
    const data = (await response.json()) as T;
    return { ok: true, data, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "parse",
        status: response.status,
        message: "[buildstack] Failed to parse JSON response",
        cause: error,
      },
    };
  }
}
