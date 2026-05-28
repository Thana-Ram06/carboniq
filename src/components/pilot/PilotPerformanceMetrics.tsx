import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getPilotPerformanceMetrics } from "@/lib/pilot/pilot-tracker";

export function PilotPerformanceMetrics() {
  const pilots = getPilotPerformanceMetrics();

  const STATUS_STYLE: Record<string, string> = {
    healthy: "text-green-400 bg-green-500/10 border-green-500/20",
    at_risk: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    stalled: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const STATUS_ICON: Record<string, typeof CheckCircle2> = {
    healthy: CheckCircle2,
    at_risk: AlertTriangle,
    stalled: XCircle,
  };

  return (
    <div className="space-y-3">
      {pilots.map((p) => {
        const StyleCls = STATUS_STYLE[p.status] ?? STATUS_STYLE.healthy;
        const Icon = STATUS_ICON[p.status] ?? CheckCircle2;
        return (
          <div key={p.pilotId} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">{p.pilotName}</p>
                <p className="text-xs text-slate-500">{p.district}, {p.state} · {p.pilotId}</p>
              </div>
              <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${StyleCls}`}>
                <Icon className="h-2.5 w-2.5" />
                {p.status.replace("_", " ")}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px] mb-2">
              {[
                { label: "Farms Active", val: `${p.farmsActive}/${p.farmsEnrolled}` },
                { label: "NDVI Coverage", val: `${p.ndviCoveragePercent}%` },
                { label: "Audit Rate", val: `${p.auditCompletionRate}%` },
                { label: "Uptime", val: `${p.operationalUptimePct}%` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-slate-700/30 px-2 py-1.5 text-center">
                  <p className="text-white font-semibold">{stat.val}</p>
                  <p className="text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{p.carbonCreditsMinted.toLocaleString()} credits minted</span>
              <span>Data quality: {p.avgDataQualityScore.toFixed(1)}</span>
              <span>Review: {p.reviewDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
