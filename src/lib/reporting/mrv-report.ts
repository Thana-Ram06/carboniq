import type { Farm, FarmEvidence, AuditReview, MonitoringReport } from "@/types";
import type { RiskAssessment } from "@/lib/monitoring/risk-engine";
import type { CarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import type { HealthScore } from "@/lib/intelligence/health-scoring";
import type { ConfidenceScore } from "@/types";

export interface MRVReportData {
  farm: Farm;
  period: { start: string; end: string };
  generatedAt: string;
  ndvi: number;
  healthScore: HealthScore;
  carbon: CarbonIntelligence;
  risk: RiskAssessment;
  confidence: ConfidenceScore;
  evidence: FarmEvidence[];
  audit: AuditReview | null;
  methodology: string[];
  certificationNote: string;
}

export function assembleMRVReport(inputs: {
  farm: Farm;
  ndvi: number;
  healthScore: HealthScore;
  carbon: CarbonIntelligence;
  risk: RiskAssessment;
  confidence: ConfidenceScore;
  evidence: FarmEvidence[];
  audit: AuditReview | null;
  periodDays?: number;
}): MRVReportData {
  const { periodDays = 30 } = inputs;
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodDays * 86400000);

  return {
    farm: inputs.farm,
    period: {
      start: periodStart.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
    },
    generatedAt: now.toISOString(),
    ndvi: inputs.ndvi,
    healthScore: inputs.healthScore,
    carbon: inputs.carbon,
    risk: inputs.risk,
    confidence: inputs.confidence,
    evidence: inputs.evidence,
    audit: inputs.audit,
    methodology: [
      "NDVI computed via MODIS-derived phenology baselines and crop-specific multipliers",
      "Carbon estimation using IPCC 2006 Tier 1 biomass expansion factors",
      "Weather data from Open-Meteo free API (WMO standard stations)",
      "Risk assessment: max(scores)×0.55 + avg(scores)×0.45 composite model",
      "GPS validation using ray-casting point-in-polygon (GeoJSON RFC 7946)",
      "Confidence score: NDVI quality (40%) + Evidence (30%) + Audit (25%) + Consistency (15%)",
    ],
    certificationNote:
      inputs.confidence.label === "Verified" || inputs.confidence.label === "High"
        ? "This report meets VASUDHA MRV confidence thresholds for carbon credit eligibility."
        : "Additional evidence collection or audit approval required for full MRV certification.",
  };
}

export function reportToFirestorePayload(
  report: MRVReportData,
  userId: string,
  format: MonitoringReport["format"] = "mrv"
): Omit<MonitoringReport, "id" | "generatedAt"> {
  return {
    farmId: report.farm.id,
    userId,
    format,
    status: "ready",
    title: `MRV Report — ${report.farm.name} (${report.period.start} to ${report.period.end})`,
    periodStart: report.period.start,
    periodEnd: report.period.end,
    ndviAverage: report.ndvi,
    carbonScoreTonnes: report.carbon.carbonScoreTonnes,
    confidenceScore: report.confidence.overall,
    auditStatus: report.audit?.status,
    evidenceCount: report.evidence.length,
    summary: `${report.farm.name}: NDVI ${report.ndvi.toFixed(3)}, Health ${report.healthScore.label}, Carbon ${report.carbon.carbonScoreTonnes.toFixed(1)}t CO₂e, Confidence ${report.confidence.label} (${report.confidence.overall}/100). ${report.certificationNote}`,
  };
}
