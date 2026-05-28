import { NextRequest, NextResponse } from "next/server";
import {
  createAuditReview,
  updateAuditReview,
  getFarmAuditHistory,
  addVerificationLog,
} from "@/lib/firestore";
import type { AuditStatus, AuditChecklistItem } from "@/types";

// POST — create new audit or update existing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: "create" | "update";
      reviewId?: string;
      farmId: string;
      userId: string;
      auditorId: string;
      auditorName?: string;
      status: AuditStatus;
      periodStart: string;
      periodEnd: string;
      carbonScoreTonnes?: number;
      ndviAverage?: number;
      evidenceCount?: number;
      validatedEvidenceCount?: number;
      comments: string;
      checklistItems?: AuditChecklistItem[];
      confidence?: number;
    };

    if (!body.farmId || !body.userId || !body.status) {
      return NextResponse.json({ error: "farmId, userId, status are required" }, { status: 400 });
    }

    const defaultChecklist: AuditChecklistItem[] = [
      { id: "ndvi_verified", label: "NDVI data verified", passed: false },
      { id: "boundary_confirmed", label: "Farm boundary confirmed", passed: false },
      { id: "evidence_reviewed", label: "Field evidence reviewed", passed: false },
      { id: "carbon_validated", label: "Carbon calculation validated", passed: false },
      { id: "risk_assessed", label: "Risk assessment reviewed", passed: false },
    ];

    if (body.action === "update" && body.reviewId) {
      await updateAuditReview(body.reviewId, {
        status: body.status,
        comments: body.comments,
        checklistItems: body.checklistItems ?? defaultChecklist,
        confidence: body.confidence ?? 0,
      });

      await addVerificationLog({
        farmId: body.farmId,
        userId: body.userId,
        action: body.status === "approved" ? "audit_approve" : "audit_reject",
        actorId: body.auditorId,
        actorName: body.auditorName,
        details: `Audit ${body.status}: ${body.comments}`,
        metadata: { reviewId: body.reviewId, status: body.status },
      });

      return NextResponse.json({ reviewId: body.reviewId, status: body.status });
    }

    // Create new audit
    const reviewId = await createAuditReview({
      farmId: body.farmId,
      userId: body.userId,
      auditorId: body.auditorId,
      auditorName: body.auditorName,
      status: body.status,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      carbonScoreTonnes: body.carbonScoreTonnes,
      ndviAverage: body.ndviAverage,
      evidenceCount: body.evidenceCount ?? 0,
      validatedEvidenceCount: body.validatedEvidenceCount ?? 0,
      comments: body.comments,
      checklistItems: body.checklistItems ?? defaultChecklist,
      confidence: body.confidence ?? 0,
    });

    await addVerificationLog({
      farmId: body.farmId,
      userId: body.userId,
      action: "audit_submit",
      actorId: body.auditorId,
      actorName: body.auditorName,
      details: `Audit review created with status: ${body.status}`,
      metadata: { reviewId, status: body.status },
    });

    return NextResponse.json({ reviewId, status: body.status });
  } catch (err) {
    console.error("Audit review error:", err);
    return NextResponse.json({ error: "Audit operation failed" }, { status: 500 });
  }
}

// GET — fetch audit history for a farm
export async function GET(req: NextRequest) {
  try {
    const farmId = req.nextUrl.searchParams.get("farmId");
    if (!farmId) return NextResponse.json({ error: "farmId required" }, { status: 400 });

    const reviews = await getFarmAuditHistory(farmId, 10);
    return NextResponse.json({ reviews, count: reviews.length });
  } catch (err) {
    console.error("Get audit error:", err);
    return NextResponse.json({ error: "Failed to fetch audit history" }, { status: 500 });
  }
}
