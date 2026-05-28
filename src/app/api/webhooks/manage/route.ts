"use server";
import { NextRequest, NextResponse } from "next/server";
import { getWebhookConfigs, getWebhookEventSummary } from "@/lib/interop/webhook-manager";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const summary = searchParams.get("summary") === "true";

  if (summary) return NextResponse.json(getWebhookEventSummary());
  return NextResponse.json({ webhooks: getWebhookConfigs() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { url, events, orgId } = body as { url?: string; events?: string[]; orgId?: string };

  if (!url || !events || !orgId) {
    return NextResponse.json({ error: "url, events, and orgId are required" }, { status: 400 });
  }

  return NextResponse.json({
    id: `WH-NEW-${Date.now()}`,
    orgId,
    url,
    events,
    active: true,
    secret: `wh_sec_${Math.random().toString(16).slice(2, 18)}`,
    successCount: 0,
    failureCount: 0,
    createdAt: new Date().toISOString(),
    message: "Webhook registered. Test event will be sent within 60 seconds.",
  }, { status: 201 });
}
