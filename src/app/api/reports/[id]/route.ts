import { NextRequest, NextResponse } from "next/server";
import { getReportById } from "@/lib/firestore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Report ID required" }, { status: 400 });

    const report = await getReportById(id);
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Get report error:", err);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
