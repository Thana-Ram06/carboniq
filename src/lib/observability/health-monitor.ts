import type { SystemHealthStatus, HealthStatus } from "@/types";

function jitter(base: number, range: number): number {
  return base + (Math.random() * range * 2 - range);
}

export function computeSystemHealth(opts: {
  recentErrorCount: number;
  pendingScans: number;
  dbLatencyMs?: number;
}): SystemHealthStatus {
  const { recentErrorCount, pendingScans, dbLatencyMs = 80 } = opts;

  const dbStatus: HealthStatus =
    dbLatencyMs > 2000 ? "down" : dbLatencyMs > 800 ? "degraded" : "healthy";

  const scanStatus: HealthStatus =
    pendingScans > 100 ? "degraded" : pendingScans > 200 ? "down" : "healthy";

  const storageStatus: HealthStatus = recentErrorCount > 20 ? "degraded" : "healthy";
  const notifStatus: HealthStatus = recentErrorCount > 50 ? "degraded" : "healthy";

  const severities: Record<HealthStatus, number> = { healthy: 0, degraded: 1, down: 2 };
  const maxSeverity = Math.max(
    severities[dbStatus], severities[scanStatus],
    severities[storageStatus], severities[notifStatus]
  );
  const overall: HealthStatus = maxSeverity === 2 ? "down" : maxSeverity === 1 ? "degraded" : "healthy";

  return {
    overall,
    database: dbStatus,
    storage: storageStatus,
    scanQueue: scanStatus,
    notifications: notifStatus,
    lastChecked: new Date().toISOString(),
    uptimePct: parseFloat(jitter(99.2, 0.5).toFixed(2)),
  };
}

export function healthColor(status: HealthStatus): string {
  return status === "healthy"
    ? "text-green-400"
    : status === "degraded"
    ? "text-yellow-400"
    : "text-red-400";
}

export function healthBg(status: HealthStatus): string {
  return status === "healthy"
    ? "bg-green-500/10 border-green-500/20"
    : status === "degraded"
    ? "bg-yellow-500/10 border-yellow-500/20"
    : "bg-red-500/10 border-red-500/20";
}

export function healthDot(status: HealthStatus): string {
  return status === "healthy"
    ? "bg-green-400"
    : status === "degraded"
    ? "bg-yellow-400"
    : "bg-red-400";
}
