import { NextResponse } from "next/server";
import { getCalibrationCoefficients, getSeasonalCorrectionFactors, getCalibrationSummary } from "@/lib/calibration/calibration-engine";
import { getRegionalCalibrations, getCalibrationCoverage } from "@/lib/calibration/regional-calibration";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";

  if (mode === "coefficients") return NextResponse.json(getCalibrationCoefficients());
  if (mode === "seasonal") return NextResponse.json(getSeasonalCorrectionFactors());
  if (mode === "regional") return NextResponse.json(getRegionalCalibrations());
  if (mode === "coverage") return NextResponse.json(getCalibrationCoverage());
  return NextResponse.json({ summary: getCalibrationSummary(), coverage: getCalibrationCoverage() });
}
