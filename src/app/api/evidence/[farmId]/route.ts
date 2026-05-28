import { NextRequest, NextResponse } from "next/server";
import { getFarmEvidence } from "@/lib/firestore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;
    if (!farmId) return NextResponse.json({ error: "farmId required" }, { status: 400 });

    const evidence = await getFarmEvidence(farmId, 30);
    return NextResponse.json({ evidence, count: evidence.length });
  } catch (err) {
    console.error("Get evidence error:", err);
    return NextResponse.json({ error: "Failed to fetch evidence" }, { status: 500 });
  }
}
