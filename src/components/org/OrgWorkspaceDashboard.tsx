"use client";
import { useState } from "react";
import { Building2, Users, HardDrive, Zap, TrendingUp, Crown, Star, Rocket } from "lucide-react";
import { generateSampleOrg, generateSampleMembers, generateOrgAnalytics, getTierFeatures } from "@/lib/tenancy/org-workspace";
import type { OrgTier, WorkspaceMember } from "@/types";

const TIER_BADGE: Record<OrgTier, { label: string; color: string; icon: React.ElementType }> = {
  starter:      { label: "Starter",      color: "text-slate-300 bg-slate-500/20 border-slate-500/30",     icon: Star },
  professional: { label: "Professional", color: "text-blue-300 bg-blue-500/20 border-blue-500/30",        icon: Crown },
  enterprise:   { label: "Enterprise",   color: "text-purple-300 bg-purple-500/20 border-purple-500/30",  icon: Rocket },
};

interface Props { userId: string }

export function OrgWorkspaceDashboard({ userId }: Props) {
  const [org] = useState(() => generateSampleOrg(userId, "professional"));
  const [members] = useState<WorkspaceMember[]>(() => generateSampleMembers(org.id, 5));
  const [analytics] = useState(() => generateOrgAnalytics(org.id, 6));
  const features = getTierFeatures(org.tier);
  const badge = TIER_BADGE[org.tier];
  const BadgeIcon = badge.icon;

  const stats = [
    { icon: Building2, label: "Farms",        value: org.farmCount.toLocaleString(),                 color: "text-emerald-400" },
    { icon: Users,     label: "Members",       value: `${org.memberCount} / ${features.maxMembers}`,  color: "text-blue-400" },
    { icon: HardDrive, label: "Storage Used",  value: `${org.storageUsedGb} GB`,                      color: "text-purple-400" },
    { icon: Zap,       label: "API Calls/Mo",  value: org.apiCallsThisMonth.toLocaleString(),          color: "text-yellow-400" },
  ];

  const latestAnalytics = analytics[analytics.length - 1];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/3 p-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-white">{org.name}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badge.color}`}>
              <BadgeIcon className="h-3 w-3" />
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-400">{org.slug}.vasudha.in · {org.state}</p>
          <p className="text-xs text-slate-500 mt-0.5">Created {new Date(org.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Retention: {org.retentionDays}d</p>
          <p>External API: {org.allowExternalAPI ? "Enabled" : "Disabled"}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-white/3 p-3 text-center">
            <Icon className={`h-5 w-5 mx-auto mb-1.5 ${color}`} />
            <p className="text-base font-semibold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      {latestAnalytics && (
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-semibold text-white">This Month — {latestAnalytics.month}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { label: "Scans",      value: latestAnalytics.scansPerformed.toLocaleString() },
              { label: "Reports",    value: latestAnalytics.reportsGenerated.toString() },
              { label: "API Calls",  value: latestAnalytics.apiCallsExternal.toLocaleString() },
              { label: "Carbon Mt",  value: latestAnalytics.carbonTotalMt.toFixed(3) },
              { label: "Avg Conf.", value: `${latestAnalytics.avgConfidenceScore}%` },
              { label: "Active Usr", value: latestAnalytics.activeUsers.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-white/5 p-2">
                <p className="text-slate-400">{label}</p>
                <p className="font-medium text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Team Members</p>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 px-3 py-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {m.name?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{m.name}</p>
                <p className="text-xs text-slate-400 truncate">{m.email}</p>
              </div>
              <span className={`text-xs rounded-full px-2 py-0.5 capitalize ${
                m.role === "owner" ? "bg-yellow-500/15 text-yellow-300" :
                m.role === "admin" ? "bg-blue-500/15 text-blue-300" :
                m.role === "analyst" ? "bg-emerald-500/15 text-emerald-300" :
                "bg-slate-500/15 text-slate-300"
              }`}>
                {m.role}
              </span>
              <span className="text-xs text-slate-400 shrink-0">{m.farmCount}f</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="rounded-xl border border-white/5 bg-white/3 p-4">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Included Features</p>
        <div className="flex flex-wrap gap-2">
          {features.features.map((f) => (
            <span key={f} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-300">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
