import type { VerificationRecord, AuditLineage, TransparencyLog, ConfidenceCertification } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const AUDIT_ORGS = ["RITES India", "Bureau Veritas", "SGS India", "KPMG Assurance", "EY Climate", "Deloitte Sustainability"];
const AUDITORS = ["Priya Menon", "Ravi Kumar", "Sunita Devi", "Amit Sharma", "Kiran Rao", "Dr. Anita Patel"];
const STATES = ["Maharashtra", "Punjab", "Gujarat", "Madhya Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Andhra Pradesh"];
const STATUSES: VerificationRecord["status"][] = ["verified", "in_review", "pending", "verified", "verified", "in_review", "rejected", "verified"];

export function getVerificationRecords(limit = 12): VerificationRecord[] {
  return Array.from({ length: limit }, (_, i) => {
    const seed = seedHash(`vr-${i}`);
    const status = STATUSES[i % STATUSES.length];
    const claimed = parseFloat(sf(seed, 2.5, 18.5).toFixed(2));
    const verified = status === "verified" ? parseFloat((claimed * sf(seed + 1, 0.88, 1.05)).toFixed(2)) : null;
    const submittedAt = new Date(Date.now() - Math.floor(sf(seed + 2, 0, 120 * 86400000))).toISOString();
    return {
      id: `VR-${String(2024000 + i).padStart(7, "0")}`,
      farmId: `FARM-${String(seedHash(`fid-vr-${i}`) % 9000 + 1000)}`,
      farmName: `${STATES[i % STATES.length]} Farm ${i + 1}`,
      state: STATES[i % STATES.length],
      auditOrg: AUDIT_ORGS[i % AUDIT_ORGS.length],
      auditorName: AUDITORS[i % AUDITORS.length],
      submittedAt,
      verifiedAt: status === "verified" ? new Date(new Date(submittedAt).getTime() + 21 * 86400000).toISOString() : null,
      status,
      carbonClaimedTonnes: claimed,
      carbonVerifiedTonnes: verified,
      confidenceLevel: parseFloat(sf(seed + 3, 78, 98).toFixed(1)),
      certificateId: status === "verified" ? `CERT-${String(seedHash(`cert-${i}`)).slice(0, 8).toUpperCase()}` : null,
      standard: ["ISO 14064-3:2019", "VCS v4.4", "Gold Standard", "UNFCCC CDM"][i % 4],
    };
  });
}

export function getAuditLineage(recordId: string): AuditLineage {
  const seed = seedHash(recordId);
  const actors = ["System", "Ravi Kumar", "System", "Priya Menon", "Dr. Anita Patel", "System"];
  const actions = [
    { a: "record_created", d: "Farm verification record initialised" },
    { a: "documents_uploaded", d: "Field evidence package uploaded (12 files, 48MB)" },
    { a: "auto_validation_run", d: "Automated satellite cross-check completed: NDVI delta 0.031" },
    { a: "audit_assigned", d: "Lead auditor assigned from RITES India team" },
    { a: "site_visit_completed", d: "Field inspection completed; 3 soil samples collected" },
    { a: "certificate_issued", d: "Verification certificate issued under ISO 14064-3:2019" },
  ];
  return {
    recordId,
    farmId: `FARM-${String(seed % 9000 + 1000)}`,
    events: actions.map((ev, i) => ({
      timestamp: new Date(Date.now() - (actions.length - i) * 7 * 86400000).toISOString(),
      actor: actors[i],
      action: ev.a,
      detail: ev.d,
      hash: `0x${seedHash(`${recordId}-${i}`).toString(16).padStart(8, "0")}`,
    })),
  };
}

export function getTransparencyLogs(limit = 20): TransparencyLog[] {
  const LOG_TYPES: TransparencyLog["logType"][] = ["verification", "calibration", "model_update", "policy_change", "data_release"];
  const descriptions: Record<string, string> = {
    verification: "Batch verification of 48 farm records completed under RITES India oversight",
    calibration: "Regional NDVI bias correction updated for Maharashtra Kharif 2025",
    model_update: "Carbon estimation model v2.8.1 deployed with improved rain-fed crop coefficients",
    policy_change: "Data retention policy updated to 7-year rolling window per UNFCCC requirements",
    data_release: "Kharif 2025 NDVI dataset (3,420 records) published under CC-BY-4.0",
  };
  return Array.from({ length: limit }, (_, i) => {
    const seed = seedHash(`tlog-${i}`);
    const logType = LOG_TYPES[i % LOG_TYPES.length];
    return {
      id: `LOG-${String(i + 1).padStart(5, "0")}`,
      logType,
      description: descriptions[logType],
      actor: AUDITORS[i % AUDITORS.length],
      affectedEntities: Math.floor(sf(seed, 1, 120)),
      timestamp: new Date(Date.now() - i * 3 * 86400000).toISOString(),
      isPublic: i % 3 !== 2,
      referenceId: `REF-${seedHash(`ref-${i}`).toString(16).slice(0, 6).toUpperCase()}`,
    };
  });
}

const TIERS: ConfidenceCertification["tier"][] = ["platinum", "gold", "silver", "bronze"];

export function getConfidenceCertifications(limit = 8): ConfidenceCertification[] {
  return Array.from({ length: limit }, (_, i) => {
    const seed = seedHash(`cert-conf-${i}`);
    const ndvi = parseFloat(sf(seed, 82, 98).toFixed(1));
    const carbon = parseFloat(sf(seed + 1, 78, 96).toFixed(1));
    const overall = parseFloat(((ndvi + carbon) / 2).toFixed(1));
    const tier = overall >= 94 ? "platinum" : overall >= 88 ? "gold" : overall >= 80 ? "silver" : "bronze";
    const issuedAt = new Date(Date.now() - i * 30 * 86400000).toISOString();
    return {
      certId: `CC-${String(seedHash(`ccid-${i}`)).slice(0, 8).toUpperCase()}`,
      farmId: `FARM-${String(seedHash(`fid-cert-${i}`) % 9000 + 1000)}`,
      farmName: `${STATES[i % STATES.length]} Certified Farm ${i + 1}`,
      state: STATES[i % STATES.length],
      issuedAt,
      expiresAt: new Date(new Date(issuedAt).getTime() + 365 * 86400000).toISOString(),
      ndviConfidence: ndvi,
      carbonConfidence: carbon,
      overallConfidence: overall,
      tier,
      issuer: AUDIT_ORGS[i % AUDIT_ORGS.length],
    };
  });
}

export function getVerificationSummary() {
  const records = getVerificationRecords(20);
  return {
    total: records.length,
    verified: records.filter((r) => r.status === "verified").length,
    inReview: records.filter((r) => r.status === "in_review").length,
    pending: records.filter((r) => r.status === "pending").length,
    rejected: records.filter((r) => r.status === "rejected").length,
    avgConfidence: parseFloat((records.reduce((a, r) => a + r.confidenceLevel, 0) / records.length).toFixed(1)),
    totalCarbonVerified: parseFloat(records.filter((r) => r.carbonVerifiedTonnes).reduce((a, r) => a + (r.carbonVerifiedTonnes ?? 0), 0).toFixed(1)),
  };
}
