"use server";
import { NextRequest, NextResponse } from "next/server";
import { getPublicFarmReport } from "@/lib/public/farm-portal";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  const { farmId } = await params;
  const report = getPublicFarmReport(farmId);
  return NextResponse.json(report);
}
