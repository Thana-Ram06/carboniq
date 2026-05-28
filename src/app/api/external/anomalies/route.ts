"use server";
import { NextRequest, NextResponse } from "next/server";
import { detectAnomalies } from "@/lib/ai/anomaly-detector";
import type { CropType, IrrigationType } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId") ?? "demo-farm";
  const cropType = (searchParams.get("cropType") ?? "rice") as CropType;
  const irrigationType = (searchParams.get("irrigationType") ?? "canal") as IrrigationType;
  const state = searchParams.get("state") ?? "Maharashtra";
  const areaHectares = parseFloat(searchParams.get("area") ?? "5");

  const result = detectAnomalies({ farmId, userId: "api", cropType, irrigationType, state, areaHectares });

  return NextResponse.json({
    farmId,
    anomalyCount: result.anomalyCount,
    maxZScore: result.maxZScore,
    severity: result.severity,
    events: result.events,
    overallConfidence: result.overallConfidence,
    meta: { source: "VASUDHA Anomaly Engine v9", generatedAt: new Date().toISOString() },
  });
}
