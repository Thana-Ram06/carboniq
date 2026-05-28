import { BarChart2, Users, Smartphone, Wifi } from "lucide-react";
import { getPlatformSummary } from "@/lib/analytics/prod-analytics";
import { UserWorkflowMetrics } from "@/components/analytics/UserWorkflowMetrics";
import { RegionalUsageMap } from "@/components/analytics/RegionalUsageMap";

export default function AnalyticsPage() {
  const summary = getPlatformSummary();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Production Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">Real user workflow completion, regional distribution, and platform performance</p>
      </div>

      {/* Platform summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-slate-400">Active Farms</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalActiveFarms.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">{summary.statesActive} states</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="h-4 w-4 text-green-400" />
            <span className="text-xs text-slate-400">Monthly Scans</span>
          </div>
          <p className="text-2xl font-bold text-white">{(summary.totalMonthlyScans / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-500 mt-0.5">satellite analytics</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-slate-400">Mobile Usage</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.avgMobileUsagePct.toFixed(0)}%</p>
          <p className="text-xs text-slate-500 mt-0.5">avg across states</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Wifi className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-slate-400">Offline Sync</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.avgOfflineSyncPct.toFixed(0)}%</p>
          <p className="text-xs text-slate-500 mt-0.5">offline-first users</p>
        </div>
      </div>

      {/* Workflow completion summary */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Workflow Completion</h2>
          <span className={`text-sm font-bold ${summary.avgWorkflowCompletion >= 85 ? "text-green-400" : summary.avgWorkflowCompletion >= 70 ? "text-yellow-400" : "text-red-400"}`}>
            Avg {summary.avgWorkflowCompletion.toFixed(1)}%
          </span>
        </div>
        <UserWorkflowMetrics />
      </div>

      {/* Regional usage */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Regional Usage</h2>
        </div>
        <RegionalUsageMap />
      </div>

      {/* API usage */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <h2 className="text-base font-semibold text-white mb-4">API Performance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
            <p className="text-2xl font-bold text-green-400">{summary.apiQueriesPerDay.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">API queries/day</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
            <p className="text-2xl font-bold text-white">99%</p>
            <p className="text-xs text-slate-400 mt-0.5">API completion rate</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
            <p className="text-2xl font-bold text-white">&lt;380ms</p>
            <p className="text-xs text-slate-400 mt-0.5">Avg response time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
