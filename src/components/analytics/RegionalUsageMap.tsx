"use client";
import { getRegionalUsageMetrics } from "@/lib/analytics/prod-analytics";

function confidenceColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 65) return "text-yellow-400";
  return "text-orange-400";
}

function bar(pct: number, color: string): React.ReactElement {
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-1" title={`${pct}%`}>
      <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function RegionalUsageMap() {
  const regions = getRegionalUsageMetrics();
  const totalFarms = regions.reduce((s, r) => s + r.activeFarms, 0);
  const totalScans = regions.reduce((s, r) => s + r.monthlyScans, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{totalFarms.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Active Farms</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{(totalScans / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400">Monthly Scans</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-1.5 text-slate-500 font-medium">State</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Farms</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Confidence</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Mobile</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Offline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {regions.map((r) => (
              <tr key={r.state} className="hover:bg-slate-700/20 transition-colors">
                <td className="py-2 font-medium text-white">{r.state}</td>
                <td className="py-2 text-right text-slate-300">{r.activeFarms.toLocaleString()}</td>
                <td className="py-2 text-right">
                  <span className={`font-semibold ${confidenceColor(r.avgConfidence)}`}>{r.avgConfidence}%</span>
                </td>
                <td className="py-2 text-right text-slate-300">{r.mobileUsagePct}%</td>
                <td className="py-2 text-right text-slate-300">{r.offlineSyncPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-1.5">
        {regions.slice(0, 5).map((r) => {
          const farmShare = (r.activeFarms / totalFarms) * 100;
          return (
            <div key={r.state} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-24 shrink-0 truncate">{r.state}</span>
              {bar(farmShare * 3, "bg-blue-500")}
              <span className="text-[10px] text-slate-500 w-8 text-right">{farmShare.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
