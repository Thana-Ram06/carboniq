"use server";
import { NextRequest, NextResponse } from "next/server";
import { computeDistrictReport, computeStateReport, createRegionalScanJob } from "@/lib/regional/district-processor";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get("scope") ?? "district") as "district" | "state";
  const region = searchParams.get("region") ?? "Pune";
  const state = searchParams.get("state") ?? "Maharashtra";

  const report = scope === "state"
    ? computeStateReport(state)
    : computeDistrictReport(region, state);

  return NextResponse.json({ scope, region: scope === "state" ? state : region, report });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { scope = "district", region, state, triggeredBy = "api" } = body as {
    scope?: "district" | "state" | "organization";
    region?: string;
    state?: string;
    triggeredBy?: string;
  };

  if (!region || !state) {
    return NextResponse.json({ error: "region and state are required" }, { status: 400 });
  }

  const job = createRegionalScanJob(scope, region, state, triggeredBy);
  return NextResponse.json({ job }, { status: 202 });
}
