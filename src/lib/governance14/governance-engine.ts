import type { GovernanceLog, OperationalPolicy, ComplianceTimeline } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const ACTORS = ["admin@vasudha.in", "ravi.kumar@vasudha.in", "priya.menon@vasudha.in", "system@vasudha.in", "audit-bot@vasudha.in"];
const CATEGORIES: GovernanceLog["category"][] = ["policy", "access", "data", "compliance", "deployment", "audit"];

const GOV_ACTIONS: Record<string, string[]> = {
  policy: ["policy_updated", "policy_created", "policy_reviewed"],
  access: ["role_granted", "role_revoked", "user_suspended", "api_key_created"],
  data: ["dataset_published", "export_generated", "data_retention_applied"],
  compliance: ["audit_completed", "certificate_issued", "compliance_report_generated"],
  deployment: ["deployment_approved", "environment_validated", "rollback_triggered"],
  audit: ["audit_assigned", "audit_completed", "finding_logged"],
};

export function getGovernanceLogs(limit = 20): GovernanceLog[] {
  return Array.from({ length: limit }, (_, i) => {
    const seed = seedHash(`gov-${i}`);
    const cat = CATEGORIES[i % CATEGORIES.length];
    const actions = GOV_ACTIONS[cat] ?? ["action_performed"];
    const action = actions[Math.floor(sf(seed + 1, 0, actions.length)) % actions.length];
    return {
      id: `GOV-${String(i + 1).padStart(5, "0")}`,
      category: cat,
      actor: ACTORS[i % ACTORS.length],
      action,
      entityType: ["Farm", "User", "Policy", "Dataset", "Deployment", "Certificate"][i % 6],
      entityId: `ENT-${String(seedHash(`eid-${i}`)).slice(0, 6).toUpperCase()}`,
      timestamp: new Date(Date.now() - i * 4 * 3600000).toISOString(),
      outcome: i % 12 === 5 ? "failure" : i % 8 === 3 ? "pending" : "success",
      details: `${action.replace(/_/g, " ")} completed for ${["Farm", "User", "Policy", "Dataset", "Deployment", "Certificate"][i % 6].toLowerCase()} entity`,
      ipAddress: `10.${Math.floor(sf(seed + 2, 0, 255))}.${Math.floor(sf(seed + 3, 0, 255))}.${Math.floor(sf(seed + 4, 1, 254))}`,
    };
  });
}

export function getOperationalPolicies(): OperationalPolicy[] {
  const policies = [
    { title: "Data Retention Policy", cat: "data_retention" as const, val: "7 years rolling window for verified records", owner: "Data Governance Committee" },
    { title: "Farm Audit Frequency", cat: "audit_frequency" as const, val: "Minimum 1 full audit per 12-month period per farm", owner: "Audit Standards Board" },
    { title: "Verification SLA", cat: "verification_sla" as const, val: "30 days from submission to first review; 60 days to final decision", owner: "Verification Operations" },
    { title: "API Access Control", cat: "access_control" as const, val: "OAuth2 + API key required; rate limit 1000 req/hour per partner", owner: "Platform Security Team" },
    { title: "Production Deployment Gate", cat: "deployment_gate" as const, val: "Mandatory scientific oversight sign-off + 72h staging period", owner: "DevOps & Science Team" },
    { title: "Carbon Credit Minting Control", cat: "access_control" as const, val: "Triple verification required: satellite + field + third-party audit", owner: "Carbon Registry Board" },
  ];
  return policies.map((p, i) => ({
    id: `POL-${String(i + 1).padStart(3, "0")}`,
    title: p.title,
    category: p.cat,
    description: `Governs ${p.title.toLowerCase()} across all VASUDHA platform operations and partner integrations.`,
    currentValue: p.val,
    effectiveDate: new Date(2025, i, 1).toISOString().split("T")[0],
    owner: p.owner,
    status: i === 5 ? ("draft" as const) : ("active" as const),
  }));
}

export function getComplianceTimeline(): ComplianceTimeline[] {
  return [
    { date: "2025-04-15", event: "ISO 14064-3:2019 recertification audit", standard: "ISO 14064-3", status: "completed", responsible: "Bureau Veritas" },
    { date: "2025-06-30", event: "Annual UNFCCC methodology submission", standard: "UNFCCC CDM", status: "completed", responsible: "VASUDHA Science Team" },
    { date: "2025-09-30", event: "Kharif 2025 batch verification close-out", standard: "Internal SLA", status: "completed", responsible: "Verification Operations" },
    { date: "2026-01-15", event: "Annual benchmark report publication", standard: "ISO 14064-3", status: "completed", responsible: "VASUDHA Science Team" },
    { date: "2026-03-31", event: "Rabi 2025-26 verification submissions deadline", standard: "Internal SLA", status: "completed", responsible: "Field Operations" },
    { date: "2026-06-30", event: "Mid-year calibration review", standard: "IPCC 2006", status: "upcoming", responsible: "Calibration Working Group" },
    { date: "2026-09-30", event: "Kharif 2026 batch verification window opens", standard: "Internal SLA", status: "upcoming", responsible: "Verification Operations" },
    { date: "2026-12-31", event: "Annual ISO 14064-3 surveillance audit", standard: "ISO 14064-3", status: "upcoming", responsible: "Bureau Veritas" },
  ];
}

export function getGovernanceSummary() {
  const logs = getGovernanceLogs(20);
  const policies = getOperationalPolicies();
  const timeline = getComplianceTimeline();
  return {
    totalLogs: logs.length,
    successfulActions: logs.filter((l) => l.outcome === "success").length,
    failedActions: logs.filter((l) => l.outcome === "failure").length,
    activePolicies: policies.filter((p) => p.status === "active").length,
    upcomingCompliance: timeline.filter((t) => t.status === "upcoming").length,
    overdueCompliance: timeline.filter((t) => t.status === "overdue").length,
  };
}
