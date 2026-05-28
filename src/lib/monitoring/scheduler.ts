export type ScanInterval = "daily" | "weekly" | "monthly";

export interface MonitoringConfig {
  interval: ScanInterval;
  autoEnabled: boolean;
  lastScanAt?: string;
  nextScanAt?: string;
}

const INTERVAL_MS: Record<ScanInterval, number> = {
  daily:   86_400_000,
  weekly:  604_800_000,
  monthly: 2_592_000_000,
};

export function computeNextScanDate(
  interval: ScanInterval,
  lastScanAt?: string
): string {
  const base = lastScanAt ? new Date(lastScanAt).getTime() : Date.now();
  return new Date(base + INTERVAL_MS[interval]).toISOString();
}

export function isScanDue(nextScanAt?: string): boolean {
  if (!nextScanAt) return true;
  return Date.now() >= new Date(nextScanAt).getTime();
}

export function defaultMonitoringConfig(
  interval: ScanInterval = "weekly"
): MonitoringConfig {
  return {
    interval,
    autoEnabled: true,
    nextScanAt: computeNextScanDate(interval),
  };
}

export function formatNextScan(nextScanAt?: string): string {
  if (!nextScanAt) return "Not scheduled";
  const ms = new Date(nextScanAt).getTime() - Date.now();
  if (ms <= 0) return "Due now";
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  if (d >= 1) return `in ${d} day${d !== 1 ? "s" : ""}`;
  return `in ${h} hour${h !== 1 ? "s" : ""}`;
}

export function formatLastScan(lastScanAt?: string): string {
  if (!lastScanAt) return "Never";
  const ms = Date.now() - new Date(lastScanAt).getTime();
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  return "Just now";
}
