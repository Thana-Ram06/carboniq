import { NextResponse } from "next/server";
import { getRegionalConfidences, getValidationDensities, getDataReliabilityScores, getReliabilitySummary } from "@/lib/reliability/data-reliability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";
  if (mode === "confidence") return NextResponse.json(getRegionalConfidences());
  if (mode === "density") return NextResponse.json(getValidationDensities());
  if (mode === "scores") return NextResponse.json(getDataReliabilityScores());
  return NextResponse.json({ summary: getReliabilitySummary(), scores: getDataReliabilityScores() });
}
