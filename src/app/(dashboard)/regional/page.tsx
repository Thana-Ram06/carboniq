"use client";
import { useState } from "react";
import { Map, BarChart3, TrendingUp, Activity } from "lucide-react";
import { DistrictSummaryGrid } from "@/components/regional/DistrictSummaryGrid";
import { RegionalProcessingQueue } from "@/components/regional/RegionalProcessingQueue";
import { computeStateReport } from "@/lib/regional/district-processor";
import type { IndianState } from "@/types";

const STATES: IndianState[] = ["Maharashtra", "Punjab", "Uttar Pradesh", "Karnataka", "Rajasthan", "West Bengal", "Gujarat", "Tamil Nadu"];

export default function RegionalPage() {
  const [selectedState, setSelectedState] = useState<IndianState>("Maharashtra");
  const stateReport = computeStateReport(selectedState);

  const statMetrics = [
    { icon: BarChart3,   label: "Total Farms",    value: stateReport.totalFarms.toLocaleString(),   color: "text-blue-400" },
    { icon: Map,         label: "Total Area",     value: `${stateReport.totalAreaHa.toLocaleString()} ha`, color: "text-emerald-400" },
    { icon: TrendingUp,  label: "Avg NDVI",       value: stateReport.avgNDVI.toFixed(3),            color: "text-green-400" },
    { icon: Activity,    label: "Carbon (Mt)",    value: stateReport.totalCarbonMt.toFixed(4),      color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5">
            <Map className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Regional Analytics</h1>
            <p className="text-sm text-slate-400">District-wide and state-level intelligence</p>
          </div>
        </div>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value as IndianState)}
          className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* State Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statMetrics.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-white/3 p-4">
            <Icon className={`h-5 w-5 mb-2 ${color}`} />
            <p className="text-lg font-semibold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* State Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {[
          { label: "Top District",       value: stateReport.topDistrict },
          { label: "Bottom District",    value: stateReport.bottomDistrict },
          { label: "Drought-Affected",   value: `${stateReport.droughtAffectedDistrictsPct}% districts` },
          { label: "Yield vs National",  value: `${(stateReport.yieldIndexVsNational * 100).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-white/3 p-3">
            <p className="text-slate-400 mb-1">{label}</p>
            <p className="font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* District Breakdown */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <p className="text-sm font-semibold text-white mb-4">District Intelligence — {selectedState}</p>
          <DistrictSummaryGrid state={selectedState} />
        </div>

        {/* Regional Processing Queue */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <p className="text-sm font-semibold text-white mb-4">Regional Processing Queue</p>
          <RegionalProcessingQueue state={selectedState} />
        </div>
      </div>
    </div>
  );
}
