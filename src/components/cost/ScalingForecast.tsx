"use client";
import { TrendingUp } from "lucide-react";
import { getScalingForecast } from "@/lib/cost/cost-tracker";

export function ScalingForecast() {
  const forecast = getScalingForecast();
  const maxCost = Math.max(...forecast.map((f) => f.estimatedCostUSD));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2">
        <TrendingUp className="h-4 w-4 text-blue-400 shrink-0" />
        <p className="text-sm text-blue-300 font-medium">12% monthly farm growth projected</p>
      </div>

      <div className="space-y-2">
        {forecast.map((f) => {
          const barWidth = (f.estimatedCostUSD / maxCost) * 100;
          return (
            <div key={f.month} className="rounded-xl border border-slate-700 bg-slate-700/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{f.month}</span>
                <span className="text-sm font-bold text-green-400">${f.estimatedCostUSD.toFixed(0)}/mo</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
                <span>{f.estimatedFarms.toLocaleString()} farms</span>
                <span>{f.firestoreReadsM.toFixed(1)}M reads</span>
                <span>{f.storageGb.toFixed(0)} GB stored</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
