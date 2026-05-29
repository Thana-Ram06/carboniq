import { Eye, CheckCircle2, BarChart3 } from "lucide-react";
import { getPublicEcosystemStats } from "@/lib/transparency/public-dashboards";
import { getTransparencyLogs } from "@/lib/trust/verification-registry";
import { PublicMetricsDashboard } from "@/components/transparency/PublicMetricsDashboard";

export default function TransparencyPage() {
  const stats = getPublicEcosystemStats();
  const logs = getTransparencyLogs(8);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Public Transparency</h1>
        <p className="text-slate-400 mt-1 text-sm">Open ecosystem metrics, environmental indicators, and operational transparency reports for public access</p>
      </div>

      {/* Public stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400">{s.label}</p>
              {s.isVerified && <CheckCircle2 className="h-3 w-3 text-green-400" />}
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{s.description}</p>
          </div>
        ))}
      </div>

      {/* Environmental indicators */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Environmental Indicators</h2>
          <span className="ml-auto text-xs text-slate-500">vs 2023 baseline</span>
        </div>
        <PublicMetricsDashboard />
      </div>

      {/* Transparency log */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Public Transparency Log</h2>
          <span className="ml-auto text-xs text-green-400">Public feed</span>
        </div>
        <div className="space-y-2">
          {logs.filter((l) => l.isPublic).map((l) => (
            <div key={l.id} className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2.5">
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase flex-shrink-0 ${
                l.logType === "verification" ? "bg-green-500/20 text-green-300" :
                l.logType === "calibration" ? "bg-blue-500/20 text-blue-300" :
                l.logType === "data_release" ? "bg-purple-500/20 text-purple-300" :
                "bg-slate-700 text-slate-400"
              }`}>{l.logType.replace("_", " ")}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white">{l.description}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{l.actor} · {new Date(l.timestamp).toLocaleDateString("en-IN")} · {l.affectedEntities} entities</p>
              </div>
              <span className="text-[9px] font-mono text-slate-600 flex-shrink-0">{l.referenceId}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Open data note */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <h2 className="text-sm font-semibold text-white mb-2">Open Data Commitment</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          VASUDHA publishes all ecosystem-level metrics and methodology changes as part of its transparency commitment to the public, research institutions, and regulatory bodies. Aggregate statistics are updated weekly. Farm-level data is anonymised before publication. All verification events are logged with immutable hashes for auditability.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {["Weekly Updates", "ISO 14064-3", "UNFCCC Compatible", "Open Access", "Immutable Logs"].map((tag) => (
            <span key={tag} className="rounded-full border border-slate-600 bg-slate-700/40 px-2.5 py-1 text-xs text-slate-400">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
