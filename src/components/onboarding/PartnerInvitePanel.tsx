"use client";
import { Building2, Users, TrendingUp } from "lucide-react";
import { getPartnerOrgs, getPartnerTypeConfig } from "@/lib/onboarding/partner-onboarding";

export function PartnerInvitePanel() {
  const partners = getPartnerOrgs();
  const active = partners.filter((p) => p.status === "active").length;
  const onboarding = partners.filter((p) => p.status === "onboarding").length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-green-400">{active}</p>
          <p className="text-xs text-slate-400">Active</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-blue-400">{onboarding}</p>
          <p className="text-xs text-slate-400">Onboarding</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{partners.reduce((s, p) => s + p.farmCount, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-400">Farms</p>
        </div>
      </div>

      <div className="space-y-2">
        {partners.map((p) => {
          const typeCfg = getPartnerTypeConfig(p.type);
          return (
            <div key={p.id} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-2.5">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${typeCfg.bg} ${typeCfg.border} border`}>
                <Building2 className={`h-4 w-4 ${typeCfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-white truncate">{p.name}</span>
                  <span className={`rounded-full border px-1.5 text-[9px] uppercase font-medium ${typeCfg.color} ${typeCfg.border}`}>
                    {typeCfg.label}
                  </span>
                  <span className={`text-[9px] capitalize ml-auto ${p.status === "active" ? "text-green-400" : p.status === "onboarding" ? "text-blue-400" : "text-slate-500"}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p.farmCount} farms</span>
                  <span>{p.state}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{p.onboardingProgress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
