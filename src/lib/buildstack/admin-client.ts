import "server-only";

import { getBuildstackConfig } from "./env";
import { fetchWithTimeoutRetry, parseJson } from "./http";
import type {
  BuildstackAdminEntity,
  BuildstackAdminMutationMethod,
  BuildstackAdminResult,
} from "./types";

type MutationInput = {
  entity: BuildstackAdminEntity;
  method: BuildstackAdminMutationMethod;
  body?: Record<string, unknown>;
};

async function mutateAdmin<T>(input: MutationInput): Promise<BuildstackAdminResult<T>> {
  const config = getBuildstackConfig();
  const url = `${config.baseUrl}/api/admin/${input.entity}`;
  const payload = {
    projectId: config.projectId,
    ...(input.body ?? {}),
  };

  const response = await fetchWithTimeoutRetry(url, {
    method: input.method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.adminApiKey}`,
    },
    body: input.method === "DELETE" ? JSON.stringify(payload) : JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      success: false,
      status: response.error.status,
      error: response.error,
    };
  }

  const parsed = await parseJson<unknown>(response.data);
  if (!parsed.ok) {
    return {
      success: false,
      status: parsed.error.status,
      error: parsed.error,
    };
  }

  const asRecord = parsed.data && typeof parsed.data === "object" ? (parsed.data as Record<string, unknown>) : {};
  const data = ("data" in asRecord ? asRecord.data : parsed.data) as T;

  return {
    success: true,
    status: response.status ?? 200,
    data,
  };
}

export function createPage<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "pages", method: "POST", body });
}

export function updatePage<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "pages", method: "PATCH", body });
}

export function deletePage<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "pages", method: "DELETE", body });
}

export function createBlog<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "blogs", method: "POST", body });
}

export function updateBlog<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "blogs", method: "PATCH", body });
}

export function deleteBlog<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "blogs", method: "DELETE", body });
}

export function createContentBlock<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "content-blocks", method: "POST", body });
}

export function updateContentBlock<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "content-blocks", method: "PATCH", body });
}

export function deleteContentBlock<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "content-blocks", method: "DELETE", body });
}

export function createMedia<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "media", method: "POST", body });
}

export function updateMedia<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "media", method: "PATCH", body });
}

export function deleteMedia<T>(body: Record<string, unknown>) {
  return mutateAdmin<T>({ entity: "media", method: "DELETE", body });
}
