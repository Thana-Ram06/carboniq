import { Scale, FileCheck, Calendar } from "lucide-react";
import { getGovernanceSummary, getOperationalPolicies } from "@/lib/governance14/governance-engine";
import { GovernanceLog } from "@/components/governance14/GovernanceLog";
import { PolicyTimeline } from "@/components/governance14/PolicyTimeline";

const POLICY_CAT_STYLE: Record<string, string> = {
  data_retention: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  access_control: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  audit_frequency: "text-green-400 bg-green-500/10 border-green-500/20",
  verification_sla: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  deployment_gate: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

export default function GovernancePage() {
  const summary = getGovernanceSummary();
  const policies = getOperationalPolicies();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Governance & Compliance</h1>
        <p className="text-slate-400 mt-1 text-sm">Governance logs, operational policies, compliance timelines, and deployment governance reports</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.successfulActions}</p>
          <p className="text-xs text-slate-400">Successful Actions</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-red-400">{summary.failedActions}</p>
          <p className="text-xs text-slate-400">Failed Actions</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.activePolicies}</p>
          <p className="text-xs text-slate-400">Active Policies</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.upcomingCompliance}</p>
          <p className="text-xs text-slate-400">Upcoming Deadlines</p>
        </div>
      </div>

      {/* Operational policies */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-purple-400" />
          <h2 className="text-base font-semibold text-white">Operational Policies</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.activePolicies} active</span>
        </div>
        <div className="space-y-2">
          {policies.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-semibold text-white">{p.title}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase ${POLICY_CAT_STYLE[p.category] ?? POLICY_CAT_STYLE.access_control}`}>
                    {p.category.replace(/_/g, " ")}
                  </span>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${p.status === "active" ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-slate-400 bg-slate-700/30 border-slate-600"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 mb-1">{p.currentValue}</p>
              <p className="text-[10px] text-slate-500">{p.owner} · Effective {p.effectiveDate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Governance log and compliance timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Governance Activity Log</h2>
          </div>
          <GovernanceLog />
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-green-400" />
            <h2 className="text-base font-semibold text-white">Compliance Timeline</h2>
          </div>
          <PolicyTimeline />
        </div>
      </div>
    </div>
  );
}
