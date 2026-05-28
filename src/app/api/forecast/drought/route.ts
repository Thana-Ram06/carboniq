"use server";
import { NextRequest, NextResponse } from "next/server";
import { computeDroughtForecast } from "@/lib/forecast/drought-predictor";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") ?? "Pune";
  const state = searchParams.get("state") ?? "Maharashtra";
  const ndvi = searchParams.get("ndvi") ? parseFloat(searchParams.get("ndvi")!) : undefined;

  const forecast = computeDroughtForecast(region, state, ndvi);
  return NextResponse.json(forecast);
}
