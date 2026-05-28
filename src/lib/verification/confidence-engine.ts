import type { ConfidenceScore, AuditReview, FarmEvidence } from "@/types";

interface ConfidenceInputs {
  ndvi: number;
  riskScore: number;
  evidence: FarmEvidence[];
  audit: AuditReview | null;
  scanCount?: number;
}

export function computeConfidenceScore(inputs: ConfidenceInputs): ConfidenceScore {
  const { ndvi, riskScore, evidence, audit, scanCount = 1 } = inputs;

  // NDVI score (0-40): higher NDVI and multiple scans = better
  const ndviQuality = Math.max(0, Math.min(1, (ndvi - 0.1) / 0.7));
  const scanBonus = Math.min(10, (scanCount - 1) * 3);
  const ndviScore = Math.round(ndviQuality * 30 + scanBonus);

  // Evidence score (0-30): validated photo/measurement uploads
  const validated = evidence.filter((e) => e.status === "validated");
  const photoCount = evidence.filter((e) => e.type === "photo" && e.status === "validated").length;
  const measureCount = evidence.filter((e) => e.type === "measurement" && e.status === "validated").length;
  const gpsValid = evidence.filter((e) => e.gpsValidation === "valid").length;
  const evidenceScore = Math.min(30, Math.round(
    validated.length * 4 +
    photoCount * 2 +
    measureCount * 3 +
    gpsValid * 2
  ));

  // Audit score (0-25): approved audit = full points, in_review = partial
  let auditScore = 0;
  if (audit?.status === "approved") auditScore = 25;
  else if (audit?.status === "in_review") auditScore = 12;
  else if (audit?.status === "requires_recheck") auditScore = 5;
  else if (audit?.status === "pending") auditScore = 3;

  // Consistency score (0-15): inverse of risk, penalizes instability
  const riskPenalty = Math.round(riskScore * 0.15);
  const consistencyScore = Math.max(0, 15 - riskPenalty);

  const overall = Math.min(100, ndviScore + evidenceScore + auditScore + consistencyScore);

  const label: ConfidenceScore["label"] =
    overall >= 80 ? "Verified" :
    overall >= 60 ? "High" :
    overall >= 40 ? "Medium" :
    overall >= 20 ? "Low" : "Insufficient";

  return {
    overall,
    label,
    ndviScore,
    evidenceScore,
    auditScore,
    consistencyScore,
    breakdown: {
      scansCompleted: scanCount,
      evidenceValidated: validated.length,
      auditApproved: audit?.status === "approved",
      riskPenalty,
    },
  };
}

export function confidenceLabelColor(label: ConfidenceScore["label"]): string {
  return {
    Verified: "text-emerald-400",
    High: "text-green-400",
    Medium: "text-yellow-400",
    Low: "text-orange-400",
    Insufficient: "text-red-400",
  }[label];
}

export function confidenceLabelBg(label: ConfidenceScore["label"]): string {
  return {
    Verified: "bg-emerald-500/10 border-emerald-500/20",
    High: "bg-green-500/10 border-green-500/20",
    Medium: "bg-yellow-500/10 border-yellow-500/20",
    Low: "bg-orange-500/10 border-orange-500/20",
    Insufficient: "bg-red-500/10 border-red-500/20",
  }[label];
}
