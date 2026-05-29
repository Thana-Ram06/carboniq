import { NextResponse } from "next/server";
import { getPublicEcosystemStats, getEnvironmentalIndicators, getPublicStateSummaries } from "@/lib/transparency/public-dashboards";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "stats";
  if (mode === "indicators") return NextResponse.json(getEnvironmentalIndicators());
  if (mode === "states") return NextResponse.json(getPublicStateSummaries());
  return NextResponse.json(getPublicEcosystemStats());
}
