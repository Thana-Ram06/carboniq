"use server";
import { NextResponse } from "next/server";
import { getInfrastructureStatus } from "@/lib/pipeline/pipeline-engine";
import { computeReliabilityScore } from "@/lib/observability/incident-tracker";
import { getIncidentHistory } from "@/lib/observability/incident-tracker";

export async function GET() {
  const infra = getInfrastructureStatus();
  const reliability = computeReliabilityScore();
  const incidents = getIncidentHistory().filter((i) => i.status !== "resolved").slice(0, 3);

  return NextResponse.json({
    ...infra,
    reliability,
    activeIncidents: incidents,
    meta: { generatedAt: new Date().toISOString() },
  });
}
