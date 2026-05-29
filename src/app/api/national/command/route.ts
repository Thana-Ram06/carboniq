import { NextResponse } from "next/server";
import { getNationalCommandMetrics, getStateAggregations, getDistrictIntelligence, getNationalSummary } from "@/lib/national/command-center";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";
  if (mode === "states") return NextResponse.json(getStateAggregations());
  if (mode === "districts") return NextResponse.json(getDistrictIntelligence());
  if (mode === "metrics") return NextResponse.json(getNationalCommandMetrics());
  return NextResponse.json({ summary: getNationalSummary(), metrics: getNationalCommandMetrics() });
}
