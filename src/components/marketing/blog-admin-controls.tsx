"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import type { BlogMeta } from "@/lib/blog";

type BlogAdminControlsProps = {
  posts: BlogMeta[];
};

type ResponsePayload = {
  ok?: boolean;
  error?: string;
  count?: number;
  results?: Array<{ slug: string; created: boolean }>;
  localDeleted?: boolean;
  note?: string;
};

async function callAdmin(
  method: "POST" | "DELETE",
  token: string,
  body: Record<string, unknown>,
): Promise<ResponsePayload> {
  const response = await fetch("/api/blog-admin", {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-blog-admin-token": token,
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as ResponsePayload;
  if (!response.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json;
}

export function BlogAdminControls({ posts }: BlogAdminControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminEnabled = searchParams.get("admin") === "1";

  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteLocal, setDeleteLocal] = useState(false);
  const [status, setStatus] = useState("Ready");

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => a.title.localeCompare(b.title));
  }, [posts]);

  if (!adminEnabled) {
    return null;
  }

  const requireToken = () => {
    if (!token.trim()) {
      throw new Error("Enter BLOG_ADMIN_TOKEN first.");
    }
    return token.trim();
  };

  const onSyncAll = async () => {
    try {
      setBusy(true);
      setStatus("Checking markdown blog inventory...");
      const auth = requireToken();
      const result = await callAdmin("POST", auth, { action: "syncAll" });
      setStatus(result.note || `Checked ${result.count ?? 0} posts.`);
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  };

  const onSyncOne = async (slug: string) => {
    try {
      setBusy(true);
      setStatus(`Syncing ${slug}...`);
      const auth = requireToken();
      const result = await callAdmin("POST", auth, { action: "syncOne", slug });
      setStatus(result.note || `Checked ${slug}.`);
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (slug: string) => {
    try {
      setBusy(true);
      setStatus(`Deleting ${slug}...`);
      const auth = requireToken();
      const result = await callAdmin("DELETE", auth, { slug, deleteLocal });
      setStatus(`Deleted ${slug}. Local markdown removed: ${result.localDeleted ? "yes" : "no"}.`);
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-10 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Blog Admin Controls</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Use these tools to manage local markdown blog files.</p>
        </div>

        <label className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          Admin token
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="BLOG_ADMIN_TOKEN"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSyncAll}
            disabled={busy}
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Working..." : "Check Markdown Inventory"}
          </button>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={deleteLocal}
              onChange={(e) => setDeleteLocal(e.target.checked)}
            />
            Delete local markdown too
          </label>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">{status}</p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Title</th>
                <th className="py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Slug</th>
                <th className="py-2 font-semibold text-zinc-700 dark:text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((post) => (
                <tr key={post.slug} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-100">{post.title}</td>
                  <td className="py-2 pr-4 text-zinc-500">{post.slug}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSyncOne(post.slug)}
                        disabled={busy}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Sync
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(post.slug)}
                        disabled={busy}
                        className="rounded-md border border-red-300 px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
