import type { OperationalHealthMetric } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const HEALTH_COMPONENTS: Array<{ comp: string; cat: OperationalHealthMetric["category"]; baseSuccess: number; baseLatency: number }> = [
  { comp: "Sentinel-2 NDVI Pipeline", cat: "data_pipeline", baseSuccess: 98.5, baseLatency: 420 },
  { comp: "Carbon Estimation Engine", cat: "model_inference", baseSuccess: 99.2, baseLatency: 185 },
  { comp: "Anomaly Detection Model", cat: "model_inference", baseSuccess: 97.8, baseLatency: 310 },
  { comp: "Drought Forecast Pipeline", cat: "data_pipeline", baseSuccess: 99.6, baseLatency: 240 },
  { comp: "Field Evidence Sync", cat: "field_sync", baseSuccess: 95.4, baseLatency: 890 },
  { comp: "Audit Report Generator", cat: "reporting", baseSuccess: 99.1, baseLatency: 620 },
  { comp: "Carbon Credit Export", cat: "reporting", baseSuccess: 98.7, baseLatency: 480 },
  { comp: "Satellite Tile Storage", cat: "storage", baseSuccess: 99.9, baseLatency: 95 },
  { comp: "Ground Truth Database", cat: "storage", baseSuccess: 99.8, baseLatency: 42 },
  { comp: "Partner API Gateway", cat: "data_pipeline", baseSuccess: 99.4, baseLatency: 155 },
];

const STATUS_MAP: Record<string, OperationalHealthMetric["status"]> = {
  healthy: "healthy",
  degraded: "degraded",
  down: "down",
};

function getStatus(successRate: number): OperationalHealthMetric["status"] {
  if (successRate >= 98) return STATUS_MAP["healthy"] ?? "healthy";
  if (successRate >= 90) return STATUS_MAP["degraded"] ?? "degraded";
  return STATUS_MAP["down"] ?? "down";
}

export function getOperationalHealthMetrics(): OperationalHealthMetric[] {
  return HEALTH_COMPONENTS.map((c, i) => {
    const seed = seedHash(c.comp);
    const successRate = parseFloat((c.baseSuccess + sf(seed, -1.5, 0.5)).toFixed(2));
    const latency = Math.floor(c.baseLatency * (1 + sf(seed + 1, -0.1, 0.15)));
    const errors = successRate < 98 ? Math.floor(sf(seed + 2, 3, 25)) : Math.floor(sf(seed + 2, 0, 5));
    return {
      component: c.comp,
      category: c.cat,
      successRatePct: successRate,
      avgLatencyMs: latency,
      errorCount24h: errors,
      lastCheckAt: new Date(Date.now() - i * 300000).toISOString(),
      status: getStatus(successRate),
    };
  });
}

export function getOperationalSummary() {
  const metrics = getOperationalHealthMetrics();
  const healthy = metrics.filter((m) => m.status === "healthy").length;
  const degraded = metrics.filter((m) => m.status === "degraded").length;
  const down = metrics.filter((m) => m.status === "down").length;
  return {
    totalComponents: metrics.length,
    healthyComponents: healthy,
    degradedComponents: degraded,
    downComponents: down,
    avgSuccessRate: parseFloat((metrics.reduce((a, m) => a + m.successRatePct, 0) / metrics.length).toFixed(2)),
    avgLatencyMs: Math.floor(metrics.reduce((a, m) => a + m.avgLatencyMs, 0) / metrics.length),
    totalErrors24h: metrics.reduce((a, m) => a + m.errorCount24h, 0),
    overallStatus: down > 0 ? ("incident" as const) : degraded > 1 ? ("degraded" as const) : ("operational" as const),
  };
}

export function getOpsTimeline() {
  return Array.from({ length: 30 }, (_, i) => {
    const seed = seedHash(`ops-day-${i}`);
    return {
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
      avgSuccessRate: parseFloat(sf(seed, 96.5, 99.8).toFixed(2)),
      totalOperations: Math.floor(sf(seed + 1, 12000, 45000)),
      incidents: i % 7 === 0 ? 1 : 0,
    };
  });
}
