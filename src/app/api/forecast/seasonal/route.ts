"use server";
import { NextRequest, NextResponse } from "next/server";
import { computeSeasonalIntelligence } from "@/lib/forecast/seasonal-analyzer";
import { getSeasonalForecast } from "@/lib/integrations/imd-weather";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") ?? "Maharashtra";

  const imdForecast = getSeasonalForecast(state);
  const seasonal = computeSeasonalIntelligence(state, imdForecast.rainfallDeparturePct);

  return NextResponse.json({ seasonal, imdForecast });
}
