"use server";
import { NextRequest, NextResponse } from "next/server";
import { getComplianceReports, getAuditExportRecords, getComplianceSummary } from "@/lib/compliance/compliance-reporter";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "reports";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  if (type === "summary") return NextResponse.json(getComplianceSummary());
  if (type === "audit-trail") return NextResponse.json({ records: getAuditExportRecords(limit) });

  return NextResponse.json({ reports: getComplianceReports(), summary: getComplianceSummary() });
}
