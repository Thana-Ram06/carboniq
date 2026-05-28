"use client";

import { Building2, MapPin, Users, Calendar, ChevronRight } from "lucide-react";
import type { PilotOrganization, PilotStatus } from "@/types";

const STATUS_CONFIG: Record<PilotStatus, { label: string; color: string; bg: string }> = {
  onboarding: { label: "Onboarding", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  active:     { label: "Active",     color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  suspended:  { label: "Suspended",  color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20" },
  completed:  { label: "Completed",  color: "text-muted-foreground", bg: "bg-muted/40 border-border" },
};

interface PilotCardProps {
  pilot: PilotOrganization;
  onStatusChange?: (id: string, status: PilotStatus) => void;
}

export function PilotCard({ pilot, onStatusChange }: PilotCardProps) {
  const cfg = STATUS_CONFIG[pilot.status];
  const progress = pilot.farmCount > 0
    ? Math.min(100, Math.round((pilot.farmCount / Math.max(pilot.farmCount, 10)) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-border bg-card hover:border-green-500/15 transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{pilot.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-muted-foreground/40" />
            <span className="text-[11px] text-muted-foreground/50 truncate">
              {pilot.district}, {pilot.state}
            </span>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-xl bg-muted/30">
          <p className="text-sm font-bold text-foreground">{pilot.farmCount}</p>
          <p className="text-[10px] text-muted-foreground/50">Farms</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-muted/30">
          <p className="text-sm font-bold text-foreground">{pilot.farmerCount}</p>
          <p className="text-[10px] text-muted-foreground/50">Farmers</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-muted/30">
          <p className="text-sm font-bold text-foreground">{pilot.region.split(" ")[0]}</p>
          <p className="text-[10px] text-muted-foreground/50">Region</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground/40 mb-1">
          <span>Enrollment progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-400/60 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
          <Calendar className="w-2.5 h-2.5" />
          <span>Since {pilot.startDate}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
          <Users className="w-2.5 h-2.5" />
          <span>{pilot.contactName}</span>
        </div>
      </div>

      {/* Status change */}
      {onStatusChange && pilot.status !== "completed" && (
        <button
          onClick={() => {
            const next: Record<PilotStatus, PilotStatus> = {
              onboarding: "active",
              active: "completed",
              suspended: "active",
              completed: "completed",
            };
            onStatusChange(pilot.id, next[pilot.status]);
          }}
          className="flex items-center justify-center gap-1 w-full py-2 rounded-xl border border-border bg-muted/40 text-xs text-muted-foreground hover:border-green-500/20 hover:text-foreground transition-all"
        >
          Advance status <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
