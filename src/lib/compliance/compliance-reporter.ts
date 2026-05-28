import type { ComplianceReport, AuditExportRecord, ComplianceStandard } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const STANDARDS: ComplianceStandard[] = ["ISO14064", "UNFCCC", "GoldStandard", "VCS", "IPCC"];

const REPORT_TEMPLATES: Array<{ title: string; standard: ComplianceStandard; methodology: string }> = [
  { title: "Annual Carbon MRV Report 2024–25",             standard: "ISO14064",     methodology: "ISO 14064-3:2019 Tier 2 biomass accumulation with IPCC 2006 emission factors" },
  { title: "UNFCCC CDM Baseline and Monitoring Report",    standard: "UNFCCC",       methodology: "CDM Methodological Tool IPCC Tier 2 SOC Stocks, AR4 GWP factors" },
  { title: "Gold Standard Land Use Activity Report",       standard: "GoldStandard", methodology: "GS4GG Land Use Activity methodology v2.0 with satellite-verified NDVI baselines" },
  { title: "Verra VCS Project Description — Kharif 2024", standard: "VCS",          methodology: "VM0042 Improved Agricultural Land Management v2.0 with above-ground carbon stocks" },
  { title: "IPCC Tier 2 Agricultural Emissions Inventory", standard: "IPCC",         methodology: "IPCC 2006 Guidelines Vol.4 Chapter 11 N2O emissions from managed soils" },
];

export function getComplianceReports(): ComplianceReport[] {
  const now = new Date();
  return REPORT_TEMPLATES.map((tmpl, i) => {
    const seed = seedHash(`compliance-${i}`);
    const daysAgo = Math.round(sf(seed, 1, 90));
    const statusOptions: ComplianceReport["verificationStatus"][] = ["approved", "approved", "pending_review", "draft", "submitted"];
    return {
      id: `RPT-COMP-${(seed % 9999).toString().padStart(4, "0")}`,
      title: tmpl.title,
      standard: tmpl.standard,
      period: i < 2 ? "FY 2024–25" : i < 4 ? "Kharif 2024" : "Q4 2024",
      farmsIncluded: Math.round(sf(seed + 1, 80, 1200)),
      totalCarbonTonnes: parseFloat(sf(seed + 2, 240, 18400).toFixed(0)),
      verificationStatus: statusOptions[seed % statusOptions.length],
      generatedAt: new Date(now.getTime() - daysAgo * 86400000).toISOString(),
      methodology: tmpl.methodology,
      signedBy: (seed % 3 !== 0) ? "Dr. Ravi Shankar, Carbon Methodology Lead" : undefined,
    };
  });
}

export function getAuditExportRecords(count = 10): AuditExportRecord[] {
  const FARM_NAMES = ["Rajesh Farm", "Priya Fields", "Suresh Agri", "Anita Plots", "Mohan Khet", "Kavita Farms", "Amit Agritech", "Sunita Fields"];
  const AUDITORS = ["AUD-001", "AUD-002", "AUD-003"];
  const now = new Date();

  return Array.from({ length: count }, (_, i) => {
    const seed = seedHash(`audit-export-${i}`);
    const daysAgo = Math.round(sf(seed, 1, 120));
    return {
      farmId: `FARM-${(seed % 9999).toString().padStart(4, "0")}`,
      farmName: FARM_NAMES[seed % FARM_NAMES.length],
      period: "FY 2024–25",
      carbonTonnes: parseFloat(sf(seed + 1, 4, 48).toFixed(1)),
      ndviAvg: parseFloat(sf(seed + 2, 0.38, 0.82).toFixed(3)),
      evidenceCount: Math.round(sf(seed + 3, 2, 18)),
      auditorId: AUDITORS[seed % AUDITORS.length],
      verifiedAt: new Date(now.getTime() - daysAgo * 86400000).toISOString(),
      standard: STANDARDS[seed % STANDARDS.length],
    };
  });
}

export function getComplianceSummary() {
  const reports = getComplianceReports();
  const approved = reports.filter((r) => r.verificationStatus === "approved" || r.verificationStatus === "submitted").length;
  return {
    totalReports: reports.length,
    approvedReports: approved,
    pendingReports: reports.filter((r) => r.verificationStatus === "pending_review").length,
    draftReports: reports.filter((r) => r.verificationStatus === "draft").length,
    totalCarbonTonnes: reports.reduce((s, r) => s + r.totalCarbonTonnes, 0),
    standardsCovered: [...new Set(reports.map((r) => r.standard))].length,
    approvalRate: parseFloat(((approved / reports.length) * 100).toFixed(1)),
  };
}
