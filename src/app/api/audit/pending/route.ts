import { NextRequest, NextResponse } from "next/server";
import { getPendingAudits } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const reviews = await getPendingAudits(userId);
    return NextResponse.json({
      reviews,
      count: reviews.length,
      pendingCount: reviews.filter((r) => r.status === "pending").length,
      inReviewCount: reviews.filter((r) => r.status === "in_review").length,
      recheckCount: reviews.filter((r) => r.status === "requires_recheck").length,
    });
  } catch (err) {
    console.error("Pending audits error:", err);
    return NextResponse.json({ error: "Failed to fetch pending audits" }, { status: 500 });
  }
}
