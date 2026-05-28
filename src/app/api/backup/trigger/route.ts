"use server";
import { NextRequest, NextResponse } from "next/server";
import { getBackupHistory, getBackupMetrics } from "@/lib/backup/snapshot-engine";

export async function GET() {
  const metrics = getBackupMetrics();
  const recent = getBackupHistory(5);
  return NextResponse.json({ metrics, recent });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { type = "incremental", collections } = body as {
    type?: "full" | "incremental" | "collection";
    collections?: string[];
  };

  return NextResponse.json({
    jobId: `BKP-MNL-${Date.now()}`,
    type,
    collections: collections ?? ["farms", "carbon_estimations", "audit_reviews"],
    status: "running",
    startedAt: new Date().toISOString(),
    message: `${type} backup initiated. Estimated duration: 5–22 minutes.`,
  }, { status: 202 });
}
