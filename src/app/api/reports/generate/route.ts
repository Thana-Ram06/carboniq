import { NextRequest, NextResponse } from "next/server";
import { getFarm, getFarmEvidence, getLatestAuditForFarm, saveMonitoringReport, addVerificationLog } from "@/lib/firestore";
import { createNotification } from "@/lib/notifications/notification-service";
import { logActivity } from "@/lib/activity/activity-service";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { computeHealthScore } from "@/lib/intelligence/health-scoring";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { assessRisk } from "@/lib/monitoring/risk-engine";
import { computeConfidenceScore } from "@/lib/verification/confidence-engine";
import { assembleMRVReport, reportToFirestorePayload } from "@/lib/reporting/mrv-report";
import type { ReportFormat } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      farmId: string;
      userId: string;
      format?: ReportFormat;
      periodDays?: number;
    };

    const { farmId, userId, format = "mrv", periodDays = 30 } = body;
    if (!farmId || !userId) {
      return NextResponse.json({ error: "farmId and userId are required" }, { status: 400 });
    }

    const farm = await getFarm(farmId);
    if (!farm) return NextResponse.json({ error: "Farm not found" }, { status: 404 });

    // Compute intelligence
    const ndviResult = computeFarmNDVI({
      farmId, cropType: farm.cropType, irrigationType: farm.irrigationType,
      state: farm.state, areaHectares: farm.areaHectares,
    });
    const ndvi = ndviResult.current.ndvi;
    const healthScore = computeHealthScore(ndvi);
    const carbon = computeCarbonIntelligence(farm, ndvi);
    const risk = assessRisk(farm, ndvi, null);

    // Fetch evidence and audit
    const [evidence, audit] = await Promise.all([
      getFarmEvidence(farmId, 50),
      getLatestAuditForFarm(farmId),
    ]);

    const confidence = computeConfidenceScore({
      ndvi, riskScore: risk.overallRisk, evidence, audit,
    });

    const reportData = assembleMRVReport({
      farm, ndvi, healthScore, carbon, risk, confidence, evidence, audit, periodDays,
    });

    const payload = reportToFirestorePayload(reportData, userId, format);
    const reportId = await saveMonitoringReport(payload);

    await addVerificationLog({
      farmId, userId,
      action: "report_generate",
      actorId: userId,
      details: `${format.toUpperCase()} report generated. Confidence: ${confidence.overall}/100 (${confidence.label}).`,
      metadata: { reportId, format, confidence: confidence.overall },
    });

    await Promise.all([
      createNotification({
        userId,
        type: "report_ready",
        title: "MRV report ready",
        message: `${format.toUpperCase()} report for ${farm.name} generated. Confidence: ${confidence.overall}/100 (${confidence.label}).`,
        farmId,
        farmName: farm.name,
        actionUrl: "/reports",
        severity: "info",
      }),
      logActivity({
        userId,
        type: "report_generated",
        title: "MRV report generated",
        description: `${format.toUpperCase()} · Confidence ${confidence.overall}/100 · ${confidence.label}`,
        farmId,
        farmName: farm.name,
        metadata: { reportId, format, confidence: confidence.overall },
      }),
    ]);

    return NextResponse.json({ reportId, reportData, payload });
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
