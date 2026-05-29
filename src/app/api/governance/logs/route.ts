import { NextResponse } from "next/server";
import { getGovernanceLogs, getOperationalPolicies, getComplianceTimeline, getGovernanceSummary } from "@/lib/governance14/governance-engine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";
  if (mode === "logs") return NextResponse.json(getGovernanceLogs(Number(searchParams.get("limit") ?? 20)));
  if (mode === "policies") return NextResponse.json(getOperationalPolicies());
  if (mode === "timeline") return NextResponse.json(getComplianceTimeline());
  return NextResponse.json({ summary: getGovernanceSummary(), timeline: getComplianceTimeline() });
}
