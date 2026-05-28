/**
 * Incident Tracker — VASUDHA Phase 11
 *
 * Manages platform incidents, SLA tracking, and MTTR calculation.
 * Production: integrate with PagerDuty or Opsgenie webhooks.
 */

import type { Incident, IncidentSeverity, IncidentStatus, UptimeRecord, ReliabilityScore } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const INCIDENT_TEMPLATES: Array<{
  title: string;
  severity: IncidentSeverity;
  components: string[];
  description: string;
}> = [
  { title: "Elevated API latency on /api/external/ndvi", severity: "high", components: ["satellite", "externalAPIs"], description: "P95 latency exceeded 2000ms threshold for 15 minutes. Root cause: upstream NDVI computation queue backed up during high-load period. Mitigated via autoscaling." },
  { title: "Firestore quota warning — reads approaching limit", severity: "medium", components: ["firestore"], description: "Read operations reached 85% of daily quota. Triggered cache warming and query batching. Normal operations resumed after optimization." },
  { title: "Pipeline job failure — NDVI batch timeout", severity: "medium", components: ["pipeline"], description: "NDVI batch job for 320 farms timed out after 45 minutes. Jobs re-queued with smaller batch sizes. All farms processed within 90 minutes." },
  { title: "Authentication service degraded", severity: "critical", components: ["auth"], description: "Firebase Auth intermittently failing login requests due to regional issue. Failover to backup auth region. Resolved in 8 minutes." },
  { title: "Storage upload errors — evidence uploads failing", severity: "high", components: ["storage"], description: "Firebase Storage bucket intermittently rejecting uploads >5MB. Temporary size limit applied while investigating. Full resolution after bucket config update." },
  { title: "GEE task queue stalled", severity: "low", components: ["externalAPIs"], description: "GEE composite tasks not progressing. API rate limit reached. Tasks completed after 30-minute backoff." },
];

export function getIncidentHistory(): Incident[] {
  const now = new Date();
  return INCIDENT_TEMPLATES.map((tmpl, i) => {
    const seed = seedHash(`incident-${i}`);
    const daysAgo = Math.round(sf(seed, 1, 60));
    const startedAt = new Date(now.getTime() - daysAgo * 86400000).toISOString();
    const isResolved = i !== 0;
    const mttrMinutes = isResolved ? Math.round(sf(seed + 1, 4, 180)) : undefined;
    const resolvedAt = isResolved && mttrMinutes
      ? new Date(new Date(startedAt).getTime() + mttrMinutes * 60000).toISOString()
      : undefined;

    const status: IncidentStatus = i === 0 ? "investigating" : i === 1 ? "mitigated" : "resolved";

    return {
      id: `INC-${(1000 + i).toString()}`,
      title: tmpl.title,
      severity: tmpl.severity,
      status,
      affectedComponents: tmpl.components,
      startedAt,
      resolvedAt,
      mttrMinutes,
      description: tmpl.description,
    };
  });
}

const COMPONENTS = ["firestore", "storage", "auth", "satellite", "externalAPIs", "pipeline"];

export function getUptimeHistory(days = 30): UptimeRecord[] {
  const records: UptimeRecord[] = [];
  const now = new Date();
  for (const component of COMPONENTS) {
    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(now.getTime() - d * 86400000).toISOString().split("T")[0];
      const seed = seedHash(`${component}-${date}`);
      const incidentCount = seed % 20 === 0 ? 1 : 0;
      const downMinutes = incidentCount > 0 ? Math.round(sf(seed + 1, 2, 45)) : 0;
      const uptimePct = parseFloat((100 - downMinutes / 1440 * 100).toFixed(4));
      records.push({ component, date, uptimePct, downMinutes, incidentCount });
    }
  }
  return records;
}

export function getComponentUptime(component: string, days = 30): number {
  const records = getUptimeHistory(days).filter((r) => r.component === component);
  if (records.length === 0) return 99.9;
  const avg = records.reduce((s, r) => s + r.uptimePct, 0) / records.length;
  return parseFloat(avg.toFixed(4));
}

export function computeReliabilityScore(): ReliabilityScore {
  const availability = Math.min(100, parseFloat(
    (COMPONENTS.reduce((s, c) => s + getComponentUptime(c), 0) / COMPONENTS.length).toFixed(2)
  ));
  return {
    overall: Math.round(sf(seedHash("reliability"), 91, 98)),
    components: {
      availability,
      latency: Math.round(sf(seedHash("lat"), 82, 95)),
      errorRate: Math.round(sf(seedHash("err"), 88, 98)),
      security: Math.round(sf(seedHash("sec"), 85, 97)),
      dataIntegrity: Math.round(sf(seedHash("data"), 92, 99)),
    },
    slaCompliancePct: parseFloat(sf(seedHash("sla"), 97.5, 99.9).toFixed(2)),
    trend: "stable",
  };
}
