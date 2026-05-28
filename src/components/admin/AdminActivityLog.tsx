"use client";

import { Shield, User, MapPin, FileText, Building2, Settings2, Flag } from "lucide-react";
import type { AdminActivity } from "@/types";

const TARGET_ICONS: Record<AdminActivity["targetType"], typeof Shield> = {
  user:   User,
  farm:   MapPin,
  audit:  Shield,
  report: FileText,
  pilot:  Building2,
  system: Settings2,
};

function timeAgo(seconds: number): string {
  const diff = Math.floor(Date.now() / 1000 - seconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface AdminActivityLogProps {
  activities: AdminActivity[];
  loading?: boolean;
}

const DEMO_ACTIVITIES: AdminActivity[] = [
  { id: "1", adminId: "admin1", adminEmail: "admin@vasudha.in", action: "Role updated", targetType: "user", details: "Changed farmer@example.com role to auditor", createdAt: { seconds: Date.now() / 1000 - 120, nanoseconds: 0 } as never },
  { id: "2", adminId: "admin1", adminEmail: "admin@vasudha.in", action: "Pilot created", targetType: "pilot", details: "Created pilot org: Vidarbha Agri Co-op", createdAt: { seconds: Date.now() / 1000 - 3600, nanoseconds: 0 } as never },
  { id: "3", adminId: "admin1", adminEmail: "admin@vasudha.in", action: "Farm suspended", targetType: "farm", details: "Flagged farm abc123 for data quality issues", createdAt: { seconds: Date.now() / 1000 - 7200, nanoseconds: 0 } as never },
  { id: "4", adminId: "admin1", adminEmail: "admin@vasudha.in", action: "Report approved", targetType: "report", details: "MRV report for Q1 2026 batch approved", createdAt: { seconds: Date.now() / 1000 - 86400, nanoseconds: 0 } as never },
];

export function AdminActivityLog({ activities, loading }: AdminActivityLogProps) {
  const displayed = activities.length > 0 ? activities : DEMO_ACTIVITIES;

  if (loading) {
    return (
      <div className="space-y-2">
        {[0,1,2,3].map((i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-80 overflow-y-auto">
      {displayed.map((act) => {
        const Icon = TARGET_ICONS[act.targetType] ?? Flag;
        const ts = (act.createdAt as unknown as { seconds: number })?.seconds;
        return (
          <div
            key={act.id}
            className="flex items-start gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/20 hover:border-green-500/10 transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-3 h-3 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{act.action}</p>
              <p className="text-[10px] text-muted-foreground/60 truncate">{act.details}</p>
              <p className="text-[10px] text-muted-foreground/30 mt-0.5">{act.adminEmail}</p>
            </div>
            <span className="text-[10px] text-muted-foreground/30 flex-shrink-0">
              {ts ? timeAgo(ts) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
