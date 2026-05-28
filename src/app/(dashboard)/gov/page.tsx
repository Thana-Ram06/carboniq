import { Map, AlertTriangle, TrendingUp, Layers } from "lucide-react";
import { getNationalSnapshot } from "@/lib/gov/regional-monitor";
import { StateMonitorGrid } from "@/components/gov/StateMonitorGrid";
import { DistrictHeatmap } from "@/components/gov/DistrictHeatmap";

export default function GovDashboardPage() {
  const national = getNationalSnapshot();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Government Regional Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">State-level agricultural intelligence for district monitoring, drought alerts, and national MRV oversight</p>
      </div>

      {/* National snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <div className="flex items-center gap-2 mb-1"><Map className="h-4 w-4 text-green-400" /></div>
          <p className="text-2xl font-bold text-white">{national.totalFarms.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Registered Farms</p>
          <p className="text-[10px] text-slate-500">{national.statesMonitored} states · {national.districtsMonitored} districts</p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <div className="flex items-center gap-2 mb-1"><Layers className="h-4 w-4 text-blue-400" /></div>
          <p className="text-2xl font-bold text-white">{(national.totalAreaHa / 1000).toFixed(0)}K ha</p>
          <p className="text-xs text-slate-400">Total Area Monitored</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-yellow-400" /></div>
          <p className="text-2xl font-bold text-white">{national.avgNdvi.toFixed(3)}</p>
          <p className="text-xs text-slate-400">Avg National NDVI</p>
          <p className="text-[10px] text-slate-500">{national.avgCarbon.toFixed(1)} tCO₂e avg/farm</p>
        </div>

        <div className={`rounded-xl border px-4 py-3 ${national.highRiskStates > 0 ? "border-red-500/20 bg-red-500/10" : "border-green-500/20 bg-green-500/10"}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${national.highRiskStates > 0 ? "text-red-400" : "text-green-400"}`} />
          </div>
          <p className={`text-2xl font-bold ${national.highRiskStates > 0 ? "text-red-400" : "text-green-400"}`}>{national.highRiskStates}</p>
          <p className="text-xs text-slate-400">High-Risk States</p>
          <p className="text-[10px] text-slate-500">{national.totalAlerts} active alerts</p>
        </div>
      </div>

      {/* State monitoring grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Map className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">State-Level Intelligence</h2>
        </div>
        <StateMonitorGrid />
      </div>

      {/* District heatmap */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-orange-400" />
          <h2 className="text-base font-semibold text-white">District Risk Heatmap</h2>
          <span className="ml-auto text-xs text-slate-500">Risk score = drought × soil moisture × NDVI deficit</span>
        </div>
        <DistrictHeatmap />
      </div>
    </div>
  );
}
