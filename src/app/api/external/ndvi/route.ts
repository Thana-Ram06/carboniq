"use server";
import { NextRequest, NextResponse } from "next/server";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import type { CropType, IrrigationType } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId") ?? "demo-farm";
  const cropType = (searchParams.get("cropType") ?? "rice") as CropType;
  const irrigationType = (searchParams.get("irrigationType") ?? "canal") as IrrigationType;
  const state = searchParams.get("state") ?? "Maharashtra";
  const areaHectares = parseFloat(searchParams.get("area") ?? "5");

  const result = computeFarmNDVI({ farmId, cropType, irrigationType, state, areaHectares });

  return NextResponse.json({
    farmId,
    currentNDVI: result.current.ndvi,
    vegetationCoverage: result.current.vegetationCoverage,
    healthStatus: result.healthStatus,
    trend: result.trend,
    timeSeries: result.timeSeries,
    meta: { source: "VASUDHA NDVI Engine v9", generatedAt: new Date().toISOString() },
  });
}
