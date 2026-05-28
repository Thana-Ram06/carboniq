"use client";
import { getUptimeHistory, getComponentUptime } from "@/lib/observability/incident-tracker";

const COMPONENT_LABELS: Record<string, string> = {
  firestore: "Firestore",
  storage: "Storage",
  auth: "Auth",
  satellite: "Satellite",
  externalAPIs: "External APIs",
  pipeline: "Pipeline",
};

function uptimeColor(pct: number): string {
  if (pct >= 99.9) return "bg-green-500";
  if (pct >= 99.0) return "bg-yellow-500";
  if (pct >= 95.0) return "bg-orange-500";
  return "bg-red-500";
}

function uptimeTextColor(pct: number): string {
  if (pct >= 99.9) return "text-green-400";
  if (pct >= 99.0) return "text-yellow-400";
  if (pct >= 95.0) return "text-orange-400";
  return "text-red-400";
}

export function UptimeChart() {
  const COMPONENTS = ["firestore", "storage", "auth", "satellite", "externalAPIs", "pipeline"];
  const history = getUptimeHistory(30);

  return (
    <div className="space-y-4">
      {COMPONENTS.map((comp) => {
        const uptime = getComponentUptime(comp, 30);
        const records = history.filter((r) => r.component === comp);

        return (
          <div key={comp}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-white">{COMPONENT_LABELS[comp] ?? comp}</span>
              <span className={`text-sm font-semibold tabular-nums ${uptimeTextColor(uptime)}`}>
                {uptime.toFixed(2)}%
              </span>
            </div>
            <div className="flex gap-px h-6">
              {records.map((r) => (
                <div
                  key={r.date}
                  title={`${r.date}: ${r.uptimePct}% uptime${r.downMinutes > 0 ? ` (${r.downMinutes}m down)` : ""}`}
                  className={`flex-1 rounded-sm ${uptimeColor(r.uptimePct)} opacity-80 hover:opacity-100 transition-opacity`}
                />
              ))}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-500 pt-1">Last 30 days — each bar = 1 day</p>
    </div>
  );
}
