import { TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { getEnvironmentalIndicators } from "@/lib/transparency/public-dashboards";

const TREND_STYLE: Record<string, string> = {
  improving: "text-green-400",
  stable: "text-slate-400",
  declining: "text-red-400",
};

export function PublicMetricsDashboard() {
  const indicators = getEnvironmentalIndicators();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {indicators.map((ind) => (
        <div key={ind.indicator} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-white">{ind.indicator}</p>
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          </div>
          <div className="flex items-end gap-2 mb-1">
            <p className={`text-2xl font-bold ${TREND_STYLE[ind.trend] ?? TREND_STYLE.stable}`}>{ind.currentValue}</p>
            <p className="text-xs text-slate-500 mb-1">{ind.unit}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            {ind.changePercent >= 0
              ? <TrendingUp className="h-2.5 w-2.5 text-green-400" />
              : <TrendingDown className="h-2.5 w-2.5 text-red-400" />
            }
            <span className={ind.changePercent >= 0 ? "text-green-400" : "text-red-400"}>{Math.abs(ind.changePercent)}%</span>
            <span className="text-slate-500">vs baseline {ind.baselineValue} {ind.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
