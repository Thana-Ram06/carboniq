import { NextRequest, NextResponse } from "next/server";
import { saveFarmEvidence, addVerificationLog } from "@/lib/firestore";
import { validateEvidenceGps } from "@/lib/verification/evidence-validator";
import { getFarm } from "@/lib/firestore";
import type { EvidenceType, GpsCoordinate } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      farmId: string;
      userId: string;
      type: EvidenceType;
      title: string;
      description?: string;
      fileUrl?: string;
      fileType?: string;
      fileSizeBytes?: number;
      thumbnailUrl?: string;
      gpsCoordinate?: GpsCoordinate;
      fieldNotes?: string;
      tags?: string[];
      capturedAt?: string;
    };

    const { farmId, userId, type, title } = body;
    if (!farmId || !userId || !type || !title) {
      return NextResponse.json({ error: "farmId, userId, type, and title are required" }, { status: 400 });
    }

    const farm = await getFarm(farmId);
    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    const validation = validateEvidenceGps(body.gpsCoordinate, farm);

    const evidenceId = await saveFarmEvidence({
      farmId,
      userId,
      type,
      status: "pending",
      title,
      description: body.description,
      fileUrl: body.fileUrl,
      fileType: body.fileType,
      fileSizeBytes: body.fileSizeBytes,
      thumbnailUrl: body.thumbnailUrl,
      gpsCoordinate: body.gpsCoordinate,
      gpsValidation: validation.status,
      distanceFromBoundary: validation.distanceMeters,
      fieldNotes: body.fieldNotes,
      tags: body.tags,
      capturedAt: body.capturedAt ?? new Date().toISOString(),
    });

    await addVerificationLog({
      farmId,
      userId,
      action: "upload",
      actorId: userId,
      details: `Uploaded ${type}: "${title}". GPS: ${validation.message}`,
      metadata: { evidenceId, gpsStatus: validation.status },
    });

    return NextResponse.json({
      evidenceId,
      gpsValidation: validation.status,
      gpsMessage: validation.message,
      distanceMeters: validation.distanceMeters,
    });
  } catch (err) {
    console.error("Evidence upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
