import { NextResponse } from "next/server";
import { getBenchmarkReports, getBenchmarkSummary } from "@/lib/benchmarks/benchmark-reporter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";

  if (mode === "reports") return NextResponse.json(getBenchmarkReports());
  return NextResponse.json({ summary: getBenchmarkSummary(), reports: getBenchmarkReports() });
}
