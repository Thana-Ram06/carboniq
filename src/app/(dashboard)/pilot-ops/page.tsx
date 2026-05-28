import { Rocket, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getPilotSummary } from "@/lib/pilot/pilot-tracker";
import { PilotPerformanceMetrics } from "@/components/pilot/PilotPerformanceMetrics";

export default function PilotOpsPage() {
  const summary = getPilotSummary();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Pilot Operations</h1>
        <p className="text-slate-400 mt-1 text-sm">Track performance, adoption, and operational health across all active field pilots</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.healthyPilots}</p>
          <p className="text-xs text-slate-400">Healthy Pilots</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-yellow-400">{summary.atRiskPilots}</p>
          <p className="text-xs text-slate-400">At-Risk Pilots</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-red-400">{summary.stalledPilots}</p>
          <p className="text-xs text-slate-400">Stalled Pilots</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalCarbonCreditsMinted.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Credits Minted</p>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-white">{summary.totalFarmsEnrolled.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Farms Enrolled</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-400">{summary.totalFarmsActive.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Farms Active</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{summary.avgAuditCompletionRate}%</p>
            <p className="text-xs text-slate-400">Avg Audit Completion</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{summary.totalPilots}</p>
            <p className="text-xs text-slate-400">Total Pilots</p>
          </div>
        </div>
      </div>

      {/* Pilot performance cards */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Pilot Performance Detail</h2>
        </div>
        <PilotPerformanceMetrics />
      </div>

      {/* Status legend */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <h2 className="text-sm font-semibold text-white mb-3">Pilot Health Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { icon: CheckCircle2, color: "text-green-400", label: "Healthy", desc: "Audit completion >90%, NDVI coverage >90%, operational uptime >98%, reporting on time >85%" },
            { icon: AlertTriangle, color: "text-yellow-400", label: "At-Risk", desc: "Any key metric between 70–90%. Requires active monitoring and intervention plan within 2 weeks" },
            { icon: XCircle, color: "text-red-400", label: "Stalled", desc: "Key metrics below 70% or pilot inactive for >30 days. Escalation to program manager required" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                <p className={`font-semibold ${item.color}`}>{item.label}</p>
              </div>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
