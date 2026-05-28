import { NextResponse } from "next/server";
import { getModelAccuracyMetrics, getNDVIAccuracyRecords, getForecastAccuracyRecords, getAccuracySummary } from "@/lib/validation/model-accuracy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";

  if (mode === "models") return NextResponse.json(getModelAccuracyMetrics());
  if (mode === "ndvi") return NextResponse.json(getNDVIAccuracyRecords());
  if (mode === "forecast") return NextResponse.json(getForecastAccuracyRecords());
  return NextResponse.json(getAccuracySummary());
}
