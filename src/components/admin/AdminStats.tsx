"use client";

import { Users, MapPin, Leaf, Camera, ShieldCheck, Activity, AlertTriangle, TrendingUp, Building2, Flag } from "lucide-react";
import type { AdminPlatformStats } from "@/types";
import type { ElementType } from "react";

interface StatConfig {
  key: keyof AdminPlatformStats;
  label: string;
  icon: ElementType;
  color: string;
  bg: string;
  suffix?: string;
}

const STAT_CONFIG: StatConfig[] = [
  { key: "totalUsers",        label: "Total Users",      icon: Users,        color: "text-blue-400",    bg: "bg-blue-500/10" },
  { key: "totalFarms",        label: "Total Farms",      icon: MapPin,        color: "text-green-400",   bg: "bg-green-500/10" },
  { key: "totalAreaHa",       label: "Area (ha)",        icon: TrendingUp,    color: "text-emerald-400", bg: "bg-emerald-500/10", suffix: " ha" },
  { key: "totalCarbonTonnes", label: "Carbon (tCO₂e)",  icon: Leaf,          color: "text-teal-400",    bg: "bg-teal-500/10",   suffix: "t" },
  { key: "totalEvidence",     label: "Evidence Files",   icon: Camera,        color: "text-violet-400",  bg: "bg-violet-500/10" },
  { key: "pendingAudits",     label: "Pending Audits",   icon: ShieldCheck,   color: "text-yellow-400",  bg: "bg-yellow-500/10" },
  { key: "activeScans",       label: "Active Scans",     icon: Activity,      color: "text-cyan-400",    bg: "bg-cyan-500/10" },
  { key: "errorCount24h",     label: "Errors (24h)",     icon: AlertTriangle, color: "text-red-400",     bg: "bg-red-500/10" },
  { key: "activePilots",      label: "Active Pilots",    icon: Building2,     color: "text-indigo-400",  bg: "bg-indigo-500/10" },
  { key: "totalCampaigns",    label: "Campaigns",        icon: Flag,          color: "text-orange-400",  bg: "bg-orange-500/10" },
];

interface AdminStatsProps {
  stats: AdminPlatformStats | null;
  loading?: boolean;
}

export function AdminStats({ stats, loading }: AdminStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CONFIG.map((s) => (
          <div key={s.key} className="h-24 rounded-2xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, suffix }) => {
        const raw = stats?.[key] ?? 0;
        const value = typeof raw === "number"
          ? `${raw.toLocaleString()}${suffix ?? ""}`
          : String(raw);
        return (
          <div
            key={key}
            className="flex flex-col gap-3 p-4 rounded-2xl border border-border bg-card hover:border-green-500/15 transition-all"
          >
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">{label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
