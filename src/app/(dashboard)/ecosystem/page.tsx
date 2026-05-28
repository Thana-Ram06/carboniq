import { Globe, TrendingUp, Users, BarChart2 } from "lucide-react";
import { getEcosystemHealth, getAdoptionTrend } from "@/lib/ecosystem/ecosystem-analytics";
import { PartnerAdoptionBoard } from "@/components/ecosystem/PartnerAdoptionBoard";

export default function EcosystemPage() {
  const health = getEcosystemHealth();
  const trend = getAdoptionTrend();
  const latestTrend = trend[trend.length - 1];
  const prevTrend = trend[trend.length - 2];
  const farmGrowth = prevTrend ? Math.round(((latestTrend.farms - prevTrend.farms) / prevTrend.farms) * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Ecosystem Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">Partner adoption, deployment success, operational health, and onboarding metrics across the VASUDHA network</p>
      </div>

      {/* Ecosystem health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <Globe className="h-4 w-4 text-green-400 mb-1" />
          <p className="text-2xl font-bold text-green-400">{health.ecosystemScore}</p>
          <p className="text-xs text-slate-400">Ecosystem Score</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <Users className="h-4 w-4 text-blue-400 mb-1" />
          <p className="text-2xl font-bold text-blue-400">{health.activePartners}/{health.totalPartners}</p>
          <p className="text-xs text-slate-400">Active Partners</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <TrendingUp className="h-4 w-4 text-yellow-400 mb-1" />
          <p className="text-2xl font-bold text-white">{health.totalFarmsRegistered.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Registered Farms</p>
          {farmGrowth > 0 && <p className="text-[10px] text-green-400">+{farmGrowth}% MoM</p>}
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <BarChart2 className="h-4 w-4 text-purple-400 mb-1" />
          <p className="text-2xl font-bold text-white">{health.reportSubmissionRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-400">Reporting Rate</p>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3 text-center">
          <p className="text-lg font-bold text-white">{health.avgOnboardingDays.toFixed(0)}d</p>
          <p className="text-xs text-slate-400">Avg Onboarding</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3 text-center">
          <p className="text-lg font-bold text-white">{health.verificationCoverageRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-400">Verification Coverage</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3 text-center">
          <p className="text-lg font-bold text-white">{latestTrend.scans.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Scans This Month</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3 text-center">
          <p className="text-lg font-bold text-white">{latestTrend.partners}</p>
          <p className="text-xs text-slate-400">New Partners</p>
        </div>
      </div>

      {/* Partner adoption board */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Partner Adoption Analytics</h2>
        </div>
        <PartnerAdoptionBoard />
      </div>

      {/* Adoption trend table */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <h2 className="text-base font-semibold text-white mb-4">6-Month Growth Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-500 font-medium">Month</th>
                <th className="text-right py-2 text-slate-500 font-medium">New Partners</th>
                <th className="text-right py-2 text-slate-500 font-medium">Active Farms</th>
                <th className="text-right py-2 text-slate-500 font-medium">Scans</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {trend.map((t) => (
                <tr key={t.month} className="hover:bg-slate-700/20 transition-colors">
                  <td className="py-2 font-medium text-white">{t.month}</td>
                  <td className="py-2 text-right text-slate-300">{t.partners}</td>
                  <td className="py-2 text-right text-slate-300">{t.farms.toLocaleString()}</td>
                  <td className="py-2 text-right text-slate-300">{t.scans.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
