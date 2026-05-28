"use client";
import { getWorkflowMetrics } from "@/lib/analytics/prod-analytics";

const WORKFLOW_LABELS: Record<string, string> = {
  farm_onboarding:   "Farm Onboarding",
  evidence_upload:   "Evidence Upload",
  report_generation: "Report Generation",
  audit_review:      "Audit Review",
  api_query:         "API Query",
  offline_sync:      "Offline Sync",
};

function fmsDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

function completionColor(rate: number): string {
  if (rate >= 90) return "from-green-500 to-emerald-400";
  if (rate >= 75) return "from-yellow-500 to-amber-400";
  return "from-red-500 to-orange-400";
}

function completionText(rate: number): string {
  if (rate >= 90) return "text-green-400";
  if (rate >= 75) return "text-yellow-400";
  return "text-red-400";
}

export function UserWorkflowMetrics() {
  const metrics = getWorkflowMetrics();

  return (
    <div className="space-y-3">
      {metrics.map((m) => (
        <div key={m.workflow} className="rounded-xl border border-slate-700 bg-slate-700/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">{WORKFLOW_LABELS[m.workflow] ?? m.workflow}</span>
            <span className={`text-sm font-bold ${completionText(m.completionRate)}`}>{m.completionRate.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${completionColor(m.completionRate)} transition-all duration-300`}
              style={{ width: `${m.completionRate}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500">
            <span title="Daily volume">{m.dailyVolume}/day</span>
            <span title="Avg duration">avg {fmsDuration(m.avgDurationMs)}</span>
            <span title="P95 duration">p95 {fmsDuration(m.p95DurationMs)}</span>
            <span title="Error rate" className={m.errorRate > 2 ? "text-yellow-500" : ""}>{m.errorRate.toFixed(1)}% err</span>
          </div>
          {m.dropoffStep && (
            <p className="text-[10px] text-orange-400 mt-1">Drop-off: {m.dropoffStep.replace(/_/g, " ")}</p>
          )}
        </div>
      ))}
    </div>
  );
}
