import { Rocket, Package, TrendingUp, Clock } from "lucide-react";
import { getDeploymentTemplates, getPilotRollouts } from "@/lib/deployment/template-engine";
import { DeploymentTemplateCard } from "@/components/deployment/DeploymentTemplateCard";
import { PilotRolloutTracker } from "@/components/deployment/PilotRolloutTracker";

export default function DeploymentPage() {
  const templates = getDeploymentTemplates();
  const pilots = getPilotRollouts();
  const activePilots = pilots.filter((p) => p.status === "active").length;
  const totalDeployedFarms = pilots.reduce((s, p) => s + p.activeFarms, 0);
  const totalTargetFarms = pilots.reduce((s, p) => s + p.targetFarms, 0);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Deployment Workflows</h1>
        <p className="text-slate-400 mt-1 text-sm">Deployment templates, pilot rollouts, and organisation activation infrastructure</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <Package className="h-4 w-4 text-blue-400 mb-1" />
          <p className="text-2xl font-bold text-white">{templates.length}</p>
          <p className="text-xs text-slate-400">Deployment Templates</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <Rocket className="h-4 w-4 text-green-400 mb-1" />
          <p className="text-2xl font-bold text-green-400">{activePilots}</p>
          <p className="text-xs text-slate-400">Active Pilots</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <TrendingUp className="h-4 w-4 text-yellow-400 mb-1" />
          <p className="text-2xl font-bold text-white">{totalDeployedFarms.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Farms Active</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <Clock className="h-4 w-4 text-slate-400 mb-1" />
          <p className="text-2xl font-bold text-white">{Math.round((totalDeployedFarms / Math.max(totalTargetFarms, 1)) * 100)}%</p>
          <p className="text-xs text-slate-400">Pilot Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Deployment Templates</h2>
          </div>
          <DeploymentTemplateCard />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-5 w-5 text-green-400" />
            <h2 className="text-base font-semibold text-white">Pilot Rollouts</h2>
          </div>
          <PilotRolloutTracker />
        </div>
      </div>

      {/* Template usage stats */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <h2 className="text-base font-semibold text-white mb-4">Template Adoption</h2>
        <div className="space-y-2">
          {templates.sort((a, b) => b.usedBy - a.usedBy).map((t) => {
            const maxUsed = Math.max(...templates.map((x) => x.usedBy));
            return (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-44 shrink-0 truncate">{t.name}</span>
                <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(t.usedBy / maxUsed) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-white w-6 text-right">{t.usedBy}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
