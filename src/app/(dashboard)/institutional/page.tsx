import { Building2, Users, Globe } from "lucide-react";
import { getInstitutionalSummary, getInstitutionalWorkspaces } from "@/lib/institutional/institutional-network";
import { InstitutionalNetwork } from "@/components/institutional/InstitutionalNetwork";

const ACCESS_STYLE: Record<string, string> = {
  admin: "text-red-400 bg-red-500/10 border-red-500/20",
  read_write: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  read_only: "text-slate-400 bg-slate-700/30 border-slate-600",
};

export default function InstitutionalPage() {
  const summary = getInstitutionalSummary();
  const workspaces = getInstitutionalWorkspaces();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Institutional Partner Network</h1>
        <p className="text-slate-400 mt-1 text-sm">Governing bodies, validators, contributors, and observers across government, research, NGO, and finance institutions</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.totalPartners}</p>
          <p className="text-xs text-slate-400">Institutional Partners</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.govPartners}</p>
          <p className="text-xs text-slate-400">Government Partners</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.researchPartners}</p>
          <p className="text-xs text-slate-400">Research Partners</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalFarmsOverseen.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Farms Overseen</p>
        </div>
      </div>

      {/* Governance breakdown */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <p className="text-sm font-semibold text-white mb-3">Governance Level Breakdown</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { level: "Governing Body", count: summary.governingBodies, color: "text-green-400" },
            { level: "Validator", count: summary.validators, color: "text-blue-400" },
            { level: "Contributor", count: summary.contributors, color: "text-slate-300" },
            { level: "Observer", count: summary.observers, color: "text-slate-500" },
          ].map((g) => (
            <div key={g.level} className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3">
              <p className={`text-2xl font-bold ${g.color}`}>{g.count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{g.level}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partner list */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Partner Network</h2>
        </div>
        <InstitutionalNetwork />
      </div>

      {/* Institutional workspaces */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Institutional Workspaces</h2>
          <span className="ml-auto text-xs text-slate-500">{workspaces.length} active</span>
        </div>
        <div className="space-y-2">
          {workspaces.map((w) => (
            <div key={w.id} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{w.workspaceName}</p>
                <p className="text-[10px] text-slate-500">{w.states.slice(0, 3).join(", ")}{w.states.length > 3 ? ` +${w.states.length - 3}` : ""}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-shrink-0">
                <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" />{w.activeUsers}</span>
                <span>{w.farmsManaged.toLocaleString()} farms</span>
                <span>{w.reportsGenerated} reports</span>
                <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${ACCESS_STYLE[w.dataAccessLevel] ?? ACCESS_STYLE.read_only}`}>{w.dataAccessLevel.replace(/_/g, " ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
