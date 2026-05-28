import type { WebhookConfig, WebhookEvent, ExportConnector } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const ALL_EVENTS: WebhookEvent[] = [
  "farm.created", "farm.updated", "farm.deleted",
  "carbon.calculated", "report.generated", "audit.completed",
  "incident.created", "scan.completed",
];

const WEBHOOK_SAMPLES: Array<{ url: string; orgId: string; events: WebhookEvent[] }> = [
  { orgId: "ORG-0001", url: "https://api.krishivikas.org/hooks/vasudha",  events: ["farm.created", "carbon.calculated", "report.generated"] },
  { orgId: "ORG-0002", url: "https://techfarm.in/webhooks/carbon",         events: ["scan.completed", "audit.completed"] },
  { orgId: "ORG-0003", url: "https://karnataka.gov.in/api/mrv",            events: ["report.generated", "audit.completed", "carbon.calculated"] },
  { orgId: "ORG-0001", url: "https://erp.gfa.coop/events",                 events: ALL_EVENTS },
];

export function getWebhookConfigs(): WebhookConfig[] {
  const now = new Date();
  return WEBHOOK_SAMPLES.map((w, i) => {
    const seed = seedHash(`webhook-${i}`);
    const hoursAgo = Math.round(sf(seed, 0.5, 72));
    return {
      id: `WH-${(seed % 9999).toString().padStart(4, "0")}`,
      orgId: w.orgId,
      url: w.url,
      events: w.events,
      active: i !== 2,
      secret: `wh_sec_${seed.toString(16).slice(0, 16)}`,
      lastTriggered: new Date(now.getTime() - hoursAgo * 3600000).toISOString(),
      successCount: Math.round(sf(seed + 1, 12, 2400)),
      failureCount: Math.round(sf(seed + 2, 0, 28)),
      createdAt: new Date(now.getTime() - Math.round(sf(seed + 3, 7, 120)) * 86400000).toISOString(),
    };
  });
}

export function getExportConnectors(): ExportConnector[] {
  const now = new Date();
  return [
    { id: "EXP-001", name: "Farm Registry CSV",       type: "csv",       description: "All farm records with GPS bounds, area, and crop type",                endpoint: "/api/export/farms",      lastExported: new Date(now.getTime() - 2 * 86400000).toISOString(), recordCount: 1840 },
    { id: "EXP-002", name: "Carbon Estimates JSON",   type: "json",      description: "Full carbon estimation results with confidence intervals",             endpoint: "/api/export/carbon",     lastExported: new Date(now.getTime() - 1 * 86400000).toISOString(), recordCount: 1782 },
    { id: "EXP-003", name: "Farm Boundaries GeoJSON", type: "geojson",   description: "GeoJSON polygon data for all registered farm boundaries",              endpoint: "/api/export/boundaries", lastExported: new Date(now.getTime() - 4 * 86400000).toISOString(), recordCount: 1840 },
    { id: "EXP-004", name: "Audit Trail CSV",         type: "csv",       description: "Full ISO 27001 audit event log with actor, action, and timestamp",     endpoint: "/api/security/audit",    lastExported: new Date(now.getTime() - 0.5 * 86400000).toISOString(), recordCount: 4280 },
    { id: "EXP-005", name: "Compliance Report PDF",   type: "pdf",       description: "Formatted compliance report suitable for regulatory submission",       endpoint: "/api/compliance/export", lastExported: new Date(now.getTime() - 7 * 86400000).toISOString(), recordCount: 5 },
    { id: "EXP-006", name: "District Boundaries SHP", type: "shapefile", description: "Shapefile archive of district and state administrative boundaries",    endpoint: "/api/export/districts",  recordCount: 640 },
  ];
}

export function getWebhookEventSummary() {
  const configs = getWebhookConfigs();
  return {
    totalWebhooks: configs.length,
    activeWebhooks: configs.filter((w) => w.active).length,
    totalDeliveries: configs.reduce((s, w) => s + w.successCount + w.failureCount, 0),
    successRate: parseFloat(
      ((configs.reduce((s, w) => s + w.successCount, 0) /
        Math.max(1, configs.reduce((s, w) => s + w.successCount + w.failureCount, 0))) * 100).toFixed(1)
    ),
    eventTypes: ALL_EVENTS.length,
  };
}
