"use client";
import { MapPin, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { computeDistrictReport } from "@/lib/regional/district-processor";
import { getDistrictNDVI } from "@/lib/integrations/bhuvan";

interface Props { state: string }

export function DistrictSummaryGrid({ state }: Props) {
  const bhuvanData = getDistrictNDVI(state);
  const reports = bhuvanData.map((d) => computeDistrictReport(d.districtName, state));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {reports.map((r) => {
        const isAboveAvg = r.percentileVsState >= 50;
        const hasDrought = r.droughtRiskPct > 35;
        return (
          <div key={r.districtName} className="rounded-xl border border-white/5 bg-white/3 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-sm font-semibold text-white">{r.districtName}</p>
              </div>
              {hasDrought && <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />}
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Avg NDVI</span>
                <div className="flex items-center gap-1">
                  {isAboveAvg
                    ? <TrendingUp className="h-3 w-3 text-green-400" />
                    : <TrendingDown className="h-3 w-3 text-red-400" />}
                  <span className={isAboveAvg ? "text-green-400" : "text-red-400"}>
                    {r.avgNDVI.toFixed(3)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Carbon (t/ha)</span>
                <span className="text-white">{r.avgCarbonTonnesHa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Yield (t/ha)</span>
                <span className="text-white">{r.avgYieldTha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Drought Risk</span>
                <span className={r.droughtRiskPct > 35 ? "text-orange-400" : "text-slate-300"}>
                  {r.droughtRiskPct}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State Percentile</span>
                <span className="text-white">{r.percentileVsState}th</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
