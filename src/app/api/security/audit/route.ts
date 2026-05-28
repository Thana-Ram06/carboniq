"use server";
import { NextRequest, NextResponse } from "next/server";
import { getAuditTrail, getAccessEventSummary } from "@/lib/security/audit-trail";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const userId = searchParams.get("userId") ?? undefined;
  const summary = searchParams.get("summary") === "true";

  if (summary) {
    return NextResponse.json(getAccessEventSummary());
  }

  const trail = getAuditTrail(Math.min(limit, 100), userId);
  return NextResponse.json({ entries: trail, total: trail.length });
}
