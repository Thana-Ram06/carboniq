import type { Farm, DataQualityScore, DataQualityGrade } from "@/types";

interface QualityInput {
  farm: Farm;
  evidenceCount: number;
  auditApproved: boolean;
  ndviHistory: number[];
  hasBoundary: boolean;
}

function gradeFromScore(score: number): DataQualityGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function computeDataQuality(input: QualityInput): Omit<DataQualityScore, "id" | "computedAt"> {
  const { farm, evidenceCount, auditApproved, ndviHistory, hasBoundary } = input;
  const flags: string[] = [];

  // NDVI consistency — variance check
  let ndviConsistency = 100;
  if (ndviHistory.length < 2) {
    ndviConsistency = 40;
    flags.push("Insufficient NDVI history");
  } else {
    const mean = ndviHistory.reduce((a, b) => a + b, 0) / ndviHistory.length;
    const variance = ndviHistory.reduce((sum, v) => sum + (v - mean) ** 2, 0) / ndviHistory.length;
    const stddev = Math.sqrt(variance);
    ndviConsistency = Math.max(0, Math.round(100 - stddev * 400));
    if (stddev > 0.15) flags.push("High NDVI variance detected");
  }

  // Evidence completeness
  let evidenceCompleteness = 0;
  if (evidenceCount === 0) {
    flags.push("No field evidence uploaded");
  } else if (evidenceCount < 3) {
    evidenceCompleteness = 50;
    flags.push("Low evidence count (<3 uploads)");
  } else {
    evidenceCompleteness = Math.min(100, Math.round(50 + evidenceCount * 5));
  }

  // Boundary accuracy
  const boundaryAccuracy = hasBoundary ? (farm.areaHectares > 0 ? 90 : 60) : 20;
  if (!hasBoundary) flags.push("No farm boundary defined");

  // Audit coverage
  const auditCoverage = auditApproved ? 100 : evidenceCount > 0 ? 50 : 20;
  if (!auditApproved) flags.push("Audit not approved");

  // Duplicate risk — low by default; high if farm name matches too generic patterns
  const genericNames = ["farm", "field", "plot", "khet", "खेत"];
  const isGenericName = genericNames.some(n =>
    farm.name.toLowerCase().trim() === n
  );
  const duplicateRisk = isGenericName ? 60 : 10;
  if (isGenericName) flags.push("Generic farm name — possible duplicate");

  const overallScore = Math.round(
    ndviConsistency * 0.25 +
    evidenceCompleteness * 0.25 +
    boundaryAccuracy * 0.2 +
    auditCoverage * 0.2 +
    (100 - duplicateRisk) * 0.1
  );

  return {
    farmId: farm.id,
    userId: farm.userId,
    overallScore,
    ndviConsistency,
    evidenceCompleteness,
    boundaryAccuracy,
    auditCoverage,
    duplicateRisk,
    flags,
    grade: gradeFromScore(overallScore),
  };
}

export function qualityColor(grade: DataQualityGrade): string {
  const map: Record<DataQualityGrade, string> = {
    A: "text-green-400",
    B: "text-emerald-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };
  return map[grade];
}

export function qualityBg(grade: DataQualityGrade): string {
  const map: Record<DataQualityGrade, string> = {
    A: "bg-green-500/10 border-green-500/20",
    B: "bg-emerald-500/10 border-emerald-500/20",
    C: "bg-yellow-500/10 border-yellow-500/20",
    D: "bg-orange-500/10 border-orange-500/20",
    F: "bg-red-500/10 border-red-500/20",
  };
  return map[grade];
}
