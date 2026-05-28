import { NextResponse } from "next/server";
import { getPilotPerformanceMetrics, getPilotSummary } from "@/lib/pilot/pilot-tracker";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";

  if (mode === "pilots") return NextResponse.json(getPilotPerformanceMetrics());
  return NextResponse.json({ summary: getPilotSummary(), pilots: getPilotPerformanceMetrics() });
}
