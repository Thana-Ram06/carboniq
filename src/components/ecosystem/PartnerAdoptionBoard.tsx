import { TrendingUp } from "lucide-react";
import { getPartnerAdoptionMetrics, getEcosystemHealth, getAdoptionTrend } from "@/lib/ecosystem/ecosystem-analytics";
import { getPartnerTypeConfig } from "@/lib/onboarding/partner-onboarding";

function adoptionColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-orange-400";
}

export function PartnerAdoptionBoard() {
  const metrics = getPartnerAdoptionMetrics();
  const health = getEcosystemHealth();
  const trend = getAdoptionTrend();
  const maxFarms = Math.max(...metrics.map((m) => m.farmsOnboarded));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-green-400">{health.ecosystemScore}</p>
          <p className="text-xs text-slate-400">Ecosystem Score</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{health.activePartners}</p>
          <p className="text-xs text-slate-400">Active Partners</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-blue-400">{health.reportSubmissionRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-400">Reporting Rate</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{health.avgOnboardingDays.toFixed(0)}d</p>
          <p className="text-xs text-slate-400">Avg Onboarding</p>
        </div>
      </div>

      {/* Adoption trend */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">6-Month Growth Trend</p>
        <div className="grid grid-cols-6 gap-1 items-end h-16">
          {trend.map((t) => {
            const maxFarmsInTrend = Math.max(...trend.map((x) => x.farms));
            const barH = Math.round((t.farms / maxFarmsInTrend) * 100);
            return (
              <div key={t.month} className="flex flex-col items-center gap-1" title={`${t.month}: ${t.farms} farms`}>
                <div className="w-full flex items-end justify-center flex-1">
                  <div
                    className="w-full rounded-t bg-blue-500/70 hover:bg-blue-400 transition-colors"
                    style={{ height: `${barH}%`, minHeight: "4px" }}
                  />
                </div>
                <span className="text-[9px] text-slate-500">{t.month.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Partner list */}
      <div className="space-y-2">
        {metrics.map((m) => {
          const typeCfg = getPartnerTypeConfig(m.partnerType);
          const barW = (m.farmsOnboarded / maxFarms) * 100;
          return (
            <div key={m.orgName} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white truncate">{m.orgName}</span>
                  <span className={`rounded-full border px-1.5 text-[9px] font-medium ${typeCfg.color} ${typeCfg.border}`}>{typeCfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-1">
                    <div className="h-1 rounded-full bg-blue-500" style={{ width: `${barW}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 w-16 shrink-0">{m.farmsOnboarded} farms</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-3.5 w-3.5 ${adoptionColor(m.adoptionScore)}`} />
                <span className={`text-sm font-bold ${adoptionColor(m.adoptionScore)}`}>{m.adoptionScore}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
