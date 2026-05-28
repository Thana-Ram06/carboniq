"use server";
import { NextResponse } from "next/server";
import { getPartnerAdoptionMetrics, getEcosystemHealth, getAdoptionTrend } from "@/lib/ecosystem/ecosystem-analytics";

export async function GET() {
  return NextResponse.json({
    health: getEcosystemHealth(),
    partners: getPartnerAdoptionMetrics(),
    trend: getAdoptionTrend(),
    meta: { generatedAt: new Date().toISOString() },
  });
}
