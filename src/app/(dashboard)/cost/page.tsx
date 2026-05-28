import { DollarSign, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getCostHistory, getMonthlyTotal } from "@/lib/cost/cost-tracker";
import { CostOptimizationCard } from "@/components/cost/CostOptimizationCard";
import { ScalingForecast } from "@/components/cost/ScalingForecast";

const CATEGORY_LABELS: Record<string, string> = {
  firestore_reads:  "Firestore Reads",
  firestore_writes: "Firestore Writes",
  storage:          "Storage",
  functions:        "Functions",
  egress:           "Egress",
  satellite_api:    "Satellite API",
};

export default function CostPage() {
  const history = getCostHistory(6);
  const currentMonthTotal = getMonthlyTotal();

  const currentMonth = history[history.length - 1]?.month ?? "";
  const currentMonthEntries = history.filter((e) => e.month === currentMonth);
  const prevMonth = history.find((e) => e.month !== currentMonth)?.month ?? "";
  const prevTotal = prevMonth
    ? history.filter((e) => e.month === prevMonth).reduce((s, e) => s + e.costUSD, 0)
    : 0;
  const momChange = prevTotal > 0 ? ((currentMonthTotal - prevTotal) / prevTotal) * 100 : 0;

  const months = [...new Set(history.map((e) => e.month))];
  const monthlyTotals = months.map((m) => ({
    month: m,
    total: history.filter((e) => e.month === m).reduce((s, e) => s + e.costUSD, 0),
  }));
  const maxMonthly = Math.max(...monthlyTotals.map((m) => m.total));

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Cost Optimization</h1>
        <p className="text-slate-400 mt-1 text-sm">Firebase, Vercel, and satellite API cost tracking with optimization recommendations</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <DollarSign className="h-7 w-7 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">${currentMonthTotal.toFixed(2)}</p>
              <p className="text-sm text-slate-400">{currentMonth} total</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs">
            {momChange > 0
              ? <><TrendingUp className="h-3 w-3 text-red-400" /><span className="text-red-400">+{momChange.toFixed(1)}% MoM</span></>
              : momChange < 0
              ? <><TrendingDown className="h-3 w-3 text-green-400" /><span className="text-green-400">{momChange.toFixed(1)}% MoM</span></>
              : <><Minus className="h-3 w-3 text-slate-400" /><span className="text-slate-400">Stable MoM</span></>
            }
          </div>
        </div>

        {/* Top 2 categories */}
        {currentMonthEntries.sort((a, b) => b.costUSD - a.costUSD).slice(0, 2).map((entry) => (
          <div key={entry.category} className="rounded-2xl border border-slate-700 bg-slate-700/20 px-6 py-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{CATEGORY_LABELS[entry.category] ?? entry.category}</p>
            <p className="text-2xl font-bold text-white">${entry.costUSD.toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {entry.trend === "increasing"
                ? <><TrendingUp className="h-3 w-3 text-red-400" /><span className="text-red-400">Increasing</span></>
                : entry.trend === "decreasing"
                ? <><TrendingDown className="h-3 w-3 text-green-400" /><span className="text-green-400">Decreasing</span></>
                : <><Minus className="h-3 w-3 text-slate-400" /><span className="text-slate-400">Stable</span></>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Monthly trend chart */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <h2 className="text-base font-semibold text-white mb-4">6-Month Cost Trend</h2>
        <div className="space-y-3">
          {monthlyTotals.map(({ month, total }) => (
            <div key={month} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-20 shrink-0">{month}</span>
              <div className="flex-1 bg-slate-700/50 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-300"
                  style={{ width: `${(total / maxMonthly) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-white w-16 text-right">${total.toFixed(0)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
          {currentMonthEntries.sort((a, b) => b.costUSD - a.costUSD).map((entry) => (
            <div key={entry.category} className="rounded-lg border border-slate-700 bg-slate-700/20 px-2 py-2 text-center">
              <p className="text-sm font-bold text-white">${entry.costUSD.toFixed(0)}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{CATEGORY_LABELS[entry.category] ?? entry.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization cards + scaling forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <h2 className="text-base font-semibold text-white mb-4">Optimization Recommendations</h2>
          <CostOptimizationCard />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <h2 className="text-base font-semibold text-white mb-4">Scaling Forecast</h2>
          <ScalingForecast />
        </div>
      </div>
    </div>
  );
}
