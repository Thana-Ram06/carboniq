"use server";
import { NextRequest, NextResponse } from "next/server";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import type { CropType, IrrigationType } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get("farmId") ?? "demo-farm";
  const cropType = (searchParams.get("cropType") ?? "rice") as CropType;
  const irrigationType = (searchParams.get("irrigationType") ?? "canal") as IrrigationType;
  const state = searchParams.get("state") ?? "Maharashtra";
  const areaHectares = parseFloat(searchParams.get("area") ?? "5");

  const ndvi = computeFarmNDVI({ farmId, cropType, irrigationType, state, areaHectares });
  const avgNDVI = ndvi.timeSeries.reduce((s, h) => s + h.ndvi, 0) / ndvi.timeSeries.length;
  const carbon = computeCarbonIntelligence({ id: farmId, cropType, areaHectares } as never, avgNDVI);

  return NextResponse.json({
    farmId,
    carbonScoreTonnes: carbon.carbonScoreTonnes,
    carbonPerHa: parseFloat((carbon.carbonScoreTonnes / areaHectares).toFixed(3)),
    biomassGreenTonnes: carbon.biomassGreenTonnes,
    carbonCreditEstimate: carbon.carbonCreditEstimate,
    sustainabilityIndex: carbon.sustainabilityIndex,
    confidence: carbon.confidence,
    meta: { source: "VASUDHA Carbon Engine v9", generatedAt: new Date().toISOString() },
  });
}
