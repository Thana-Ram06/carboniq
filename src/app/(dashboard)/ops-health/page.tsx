import { Activity, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getOperationalSummary, getOpsTimeline } from "@/lib/ops/operational-analytics";
import { OperationalHealthGrid } from "@/components/ops/OperationalHealthGrid";

const OVERALL_STYLE: Record<string, string> = {
  operational: "text-green-400 border-green-500/20 bg-green-500/10",
  degraded: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
  incident: "text-red-400 border-red-500/20 bg-red-500/10",
};

export default function OpsHealthPage() {
  const summary = getOperationalSummary();
  const timeline = getOpsTimeline();
  const maxOps = Math.max(...timeline.map((t) => t.totalOperations));

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Operational Health</h1>
        <p className="text-slate-400 mt-1 text-sm">Pipeline success rates, model inference latency, field sync reliability, and 30-day operational trend</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`rounded-xl border px-4 py-3 ${OVERALL_STYLE[summary.overallStatus] ?? OVERALL_STYLE.operational}`}>
          <p className="text-2xl font-bold">{summary.avgSuccessRate}%</p>
          <p className="text-xs text-slate-400">Avg Success Rate</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.healthyComponents}</p>
          <p className="text-xs text-slate-400">Healthy Components</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.avgLatencyMs}ms</p>
          <p className="text-xs text-slate-400">Avg Latency</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalErrors24h}</p>
          <p className="text-xs text-slate-400">Errors (24h)</p>
        </div>
      </div>

      {/* Status overview */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-green-400"><CheckCircle2 className="h-4 w-4" />{summary.healthyComponents} Healthy</span>
          <span className="flex items-center gap-1.5 text-yellow-400"><AlertTriangle className="h-4 w-4" />{summary.degradedComponents} Degraded</span>
          <span className="flex items-center gap-1.5 text-red-400"><XCircle className="h-4 w-4" />{summary.downComponents} Down</span>
        </div>
      </div>

      {/* Component health grid */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Component Health</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.totalComponents} components monitored</span>
        </div>
        <OperationalHealthGrid />
      </div>

      {/* 30-day operations volume */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <h2 className="text-base font-semibold text-white mb-4">30-Day Operations Volume</h2>
        <div className="flex items-end gap-0.5 h-20">
          {timeline.map((t) => {
            const pct = maxOps > 0 ? (t.totalOperations / maxOps) * 100 : 0;
            const color = t.incidents > 0 ? "bg-red-500/60" : t.avgSuccessRate >= 99 ? "bg-green-500/60" : "bg-yellow-500/60";
            return (
              <div key={t.date} className="flex-1 flex flex-col items-center">
                <div className={`w-full rounded-t ${color}`} style={{ height: `${pct.toFixed(0)}%` }} title={`${t.date}: ${t.totalOperations.toLocaleString()} ops`} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>{timeline[0]?.date}</span>
          <span>{timeline[timeline.length - 1]?.date}</span>
        </div>
      </div>

      {/* SLA targets */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <h2 className="text-sm font-semibold text-white mb-3">SLA Targets</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { metric: "Pipeline Success Rate", target: "≥99%", actual: `${summary.avgSuccessRate}%` },
            { metric: "P95 Latency", target: "≤500ms", actual: `${summary.avgLatencyMs}ms` },
            { metric: "Healthy Components", target: "≥90%", actual: `${((summary.healthyComponents / summary.totalComponents) * 100).toFixed(0)}%` },
            { metric: "Error Rate (24h)", target: "<50", actual: String(summary.totalErrors24h) },
          ].map((s) => (
            <div key={s.metric} className="rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2">
              <p className="text-white font-medium">{s.actual}</p>
              <p className="text-slate-500">{s.metric}</p>
              <p className="text-slate-600">Target: {s.target}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
