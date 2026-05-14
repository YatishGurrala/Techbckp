import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { isSupportedBuildstackEvent, verifyBuildstackSignature } from "@/lib/buildstack/webhook";

export const dynamic = "force-dynamic";

type WebhookBody = {
  type?: string;
  slug?: string;
};

function revalidateMarketingPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");

  if (slug) {
    revalidatePath(`/blog/${encodeURIComponent(slug)}`);
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-buildstack-signature");

  if (!verifyBuildstackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: WebhookBody = {};
  try {
    body = rawBody ? (JSON.parse(rawBody) as WebhookBody) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventType = typeof body.type === "string" ? body.type : "";
  if (!isSupportedBuildstackEvent(eventType)) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  revalidateMarketingPaths(body.slug);

  return NextResponse.json({ ok: true, revalidated: true }, { status: 200 });
}
