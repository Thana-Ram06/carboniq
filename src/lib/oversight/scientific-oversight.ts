import type { PeerReviewRecord, CalibrationApproval, MethodologyRevision } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const REVIEWERS = ["Dr. Anita Sharma", "Prof. R. Krishnan", "Dr. M. Venkateswarlu", "Dr. S. Pattnaik", "Prof. T. Nagarajan"];
const SUBMITTERS = ["VASUDHA Science Team", "Calibration Working Group", "Field Operations Team", "External Advisory Board"];

export function getPeerReviewRecords(): PeerReviewRecord[] {
  const reviews = [
    { title: "NDVI-Biomass Allometric Equation Revision 2025", type: "methodology" as const, status: "approved" as const, round: 2 },
    { title: "Maharashtra Regional Calibration v3.1 Approval", type: "calibration" as const, status: "approved" as const, round: 1 },
    { title: "Annual Accuracy Benchmark Report 2025", type: "report" as const, status: "approved" as const, round: 1 },
    { title: "Soil Carbon Depth Sampling Protocol Update", type: "validation" as const, status: "under_review" as const, round: 1 },
    { title: "Drought Forecast Model v4.1 Validation", type: "validation" as const, status: "revision_requested" as const, round: 2 },
    { title: "Carbon Fraction Coefficients Rabi 2025-26", type: "calibration" as const, status: "submitted" as const, round: 1 },
    { title: "Sentinel-2 Cloud Masking Algorithm Update", type: "methodology" as const, status: "under_review" as const, round: 1 },
  ];
  return reviews.map((r, i) => {
    const seed = seedHash(`pr-${i}`);
    const submittedAt = new Date(Date.now() - Math.floor(sf(seed, 10, 90)) * 86400000).toISOString();
    return {
      id: `PR-${String(i + 1).padStart(4, "0")}`,
      title: r.title,
      submittedBy: SUBMITTERS[i % SUBMITTERS.length],
      reviewedBy: REVIEWERS.slice(0, Math.floor(sf(seed + 1, 2, 4))),
      submittedAt,
      deadline: new Date(new Date(submittedAt).getTime() + 30 * 86400000).toISOString(),
      status: r.status,
      reviewType: r.type,
      summary: r.status === "approved" ? "Methodology validated against ISO 14064-3 requirements. Approved with minor editorial corrections." : r.status === "revision_requested" ? "Requires additional validation against unseen test dataset and bias analysis in semi-arid zones." : "Under active review by the Scientific Advisory Committee.",
      revisionRound: r.round,
    };
  });
}

export function getCalibrationApprovals(): CalibrationApproval[] {
  const approvals = [
    { param: "ndvi_biomass_alpha", proposed: 1.023, current: 1.000, just: "Kharif 2025 ground truth shows 2.3% underestimation; correction applied", status: "approved" as const },
    { param: "agb_carbon_fraction", proposed: 0.468, current: 0.470, just: "IPCC AR6 updated fraction for tropical deciduous forest biome", status: "pending" as const },
    { param: "root_shoot_ratio", proposed: 0.282, current: 0.260, just: "Expanded bamboo intercropping data changes below-ground ratio", status: "approved" as const },
    { param: "sentinel_cloud_threshold", proposed: 0.18, current: 0.20, just: "Monsoon season precision degraded with 20% threshold; tighten to 18%", status: "pending" as const },
    { param: "ndvi_smoothing_window", proposed: 12.0, current: 16.0, just: "Zaid season rapid phenological change requires tighter 12-day window", status: "rejected" as const },
  ];
  return approvals.map((a, i) => ({
    id: `CA-${String(i + 1).padStart(3, "0")}`,
    paramName: a.param,
    proposedValue: a.proposed,
    currentValue: a.current,
    justification: a.just,
    proposedBy: SUBMITTERS[i % SUBMITTERS.length],
    reviewedBy: a.status !== "pending" ? REVIEWERS[i % REVIEWERS.length] : null,
    status: a.status,
    submittedAt: new Date(Date.now() - i * 12 * 86400000).toISOString(),
    resolvedAt: a.status !== "pending" ? new Date(Date.now() - i * 5 * 86400000).toISOString() : null,
  }));
}

export function getMethodologyRevisions(): MethodologyRevision[] {
  const revisions = [
    { section: "Section 4.2: NDVI Computation", revision: "Updated cloud masking algorithm to ESA Sen2Cor v2.12 with coastal aerosol band correction", reason: "Improved accuracy in coastal districts by 8%", by: "Prof. R. Krishnan", models: ["NDVI Biomass Estimator", "Anomaly Detector"] },
    { section: "Section 6.1: Carbon Accounting", revision: "Root-to-shoot ratio table expanded to include 6 additional intercropping systems", reason: "Emerging agroforestry systems not previously covered", by: "Dr. Anita Sharma", models: ["Carbon Sequestration Model"] },
    { section: "Section 8.3: Verification Protocol", revision: "Field auditor certification requirement raised from Level 2 to Level 3 ISO 14065", reason: "UNFCCC compliance requirement effective January 2026", by: "VASUDHA Science Team", models: [] },
    { section: "Section 3.5: Regional Calibration", revision: "Agro-climatic zone boundaries updated per IMD 2024 reclassification", reason: "7 districts reclassified between semi-arid and sub-humid zones", by: "Dr. S. Pattnaik", models: ["Drought Probability Forecaster", "Carbon Sequestration Model"] },
  ];
  return revisions.map((r, i) => ({
    id: `MR-${String(i + 1).padStart(3, "0")}`,
    section: r.section,
    revision: r.revision,
    reason: r.reason,
    approvedBy: r.by,
    effectiveDate: new Date(2026, i, 1).toISOString().split("T")[0],
    version: `v${3 + i}.${i + 1}`,
    impactedModels: r.models,
  }));
}

export function getOversightSummary() {
  const reviews = getPeerReviewRecords();
  const approvals = getCalibrationApprovals();
  return {
    totalReviews: reviews.length,
    approvedReviews: reviews.filter((r) => r.status === "approved").length,
    pendingReviews: reviews.filter((r) => r.status === "under_review" || r.status === "submitted").length,
    pendingCalibrations: approvals.filter((a) => a.status === "pending").length,
    methodologyRevisions: getMethodologyRevisions().length,
  };
}
