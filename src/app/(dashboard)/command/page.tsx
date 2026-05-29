import { Globe2, Satellite, AlertTriangle } from "lucide-react";
import { getNationalSummary } from "@/lib/national/command-center";
import { CommandCenterMetrics } from "@/components/national/CommandCenterMetrics";
import { StateAggregationMap } from "@/components/national/StateAggregationMap";
import { CrossStateIntelligence } from "@/components/intelligence/CrossStateIntelligence";
import { getCrossStateIntelligenceSummary } from "@/lib/intelligence/cross-state-aggregation";

export default function CommandPage() {
  const national = getNationalSummary();
  const intel = getCrossStateIntelligenceSummary();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">National Command Center</h1>
        <p className="text-slate-400 mt-1 text-sm">Nationwide monitoring, state aggregation, and real-time operational intelligence across all VASUDHA deployments</p>
      </div>

      {/* Hero status bar */}
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-semibold text-green-300">National Grid — OPERATIONAL</span>
          <span className="text-xs text-slate-500">{national.totalStates} states · {national.totalFarms.toLocaleString()} farms · {(national.totalHectares / 1000).toFixed(0)}K hectares</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {national.highAlertStates > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <AlertTriangle className="h-3 w-3" />{national.highAlertStates} states with alerts
            </span>
          )}
        </div>
      </div>

      {/* Command metrics */}
      <CommandCenterMetrics />

      {/* State aggregation and cross-state intel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">State Aggregation</h2>
            <span className="ml-auto text-xs text-slate-500">{national.totalStates} states</span>
          </div>
          <StateAggregationMap />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Satellite className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-semibold text-white">Cross-State Intelligence</h2>
            <span className="ml-auto text-xs text-slate-500">{intel.criticalDroughtZones} critical zones</span>
          </div>
          <CrossStateIntelligence />
        </div>
      </div>

      {/* National totals footer */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          {[
            { label: "Total Carbon Sequestered", value: `${(national.carbonTonnesTotal / 1000).toFixed(1)} kt CO₂e` },
            { label: "National Avg NDVI", value: String(national.avgNDVI) },
            { label: "Avg Operational Score", value: `${national.avgOperationalScore}%` },
            { label: "States Under Monitoring", value: String(national.totalStates) },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
