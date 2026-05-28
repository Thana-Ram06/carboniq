import { NextResponse } from "next/server";
import { getGroundTruthObservations, getFieldVerificationMissions, getValidationSummary } from "@/lib/validation/ground-truth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";

  if (mode === "missions") return NextResponse.json(getFieldVerificationMissions());
  if (mode === "observations") return NextResponse.json(getGroundTruthObservations(Number(searchParams.get("limit") ?? 15)));
  return NextResponse.json(getValidationSummary());
}
