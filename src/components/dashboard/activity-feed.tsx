"use client";

import {
  MapPin, BarChart3, FileText, Satellite, Leaf,
  Camera, ShieldCheck, AlertTriangle, RefreshCw, Zap,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityEventType } from "@/types";
import { cn } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";

interface ActivityItem {
  id: string;
  type: ActivityEventType | string;
  title: string;
  description: string;
  farmName?: string;
  createdAt?: Timestamp;
  /** legacy field from old mock data */
  timestamp?: Timestamp;
}

const ACTIVITY_ICONS: Record<string, { Icon: typeof MapPin; color: string; bg: string }> = {
  farm_added:        { Icon: MapPin,        color: "text-green-400",  bg: "bg-green-500/10" },
  farm_updated:      { Icon: MapPin,        color: "text-green-400",  bg: "bg-green-500/10" },
  analysis_complete: { Icon: Satellite,     color: "text-blue-400",   bg: "bg-blue-500/10" },
  report_generated:  { Icon: FileText,      color: "text-purple-400", bg: "bg-purple-500/10" },
  ndvi_update:       { Icon: Leaf,          color: "text-emerald-400",bg: "bg-emerald-500/10" },
  carbon_estimated:  { Icon: BarChart3,     color: "text-yellow-400", bg: "bg-yellow-500/10" },
  evidence_uploaded: { Icon: Camera,        color: "text-sky-400",    bg: "bg-sky-500/10" },
  audit_submitted:   { Icon: ShieldCheck,   color: "text-indigo-400", bg: "bg-indigo-500/10" },
  risk_alert:        { Icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
  scan_triggered:    { Icon: Zap,           color: "text-cyan-400",   bg: "bg-cyan-500/10" },
};

const FALLBACK = { Icon: RefreshCw, color: "text-muted-foreground", bg: "bg-muted" };

interface ActivityFeedProps {
  items?: ActivityItem[];
  loading?: boolean;
  className?: string;
  onRefresh?: () => void;
}

export function ActivityFeed({
  items = [],
  loading = false,
  className,
  onRefresh,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-border flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-border rounded w-3/4" />
              <div className="h-3 bg-border rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-10 gap-3", className)}>
        <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center">
          <Zap className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <p className="text-xs text-muted-foreground/50 text-center">
          No activity yet — events will appear here as you use the platform
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, i) => {
        const cfg = ACTIVITY_ICONS[item.type] ?? FALLBACK;
        const { Icon, color, bg } = cfg;
        const ts = item.createdAt ?? item.timestamp;

        return (
          <div
            key={item.id}
            className={cn("flex items-start gap-3 py-3.5", i < items.length - 1 && "border-b border-border")}
          >
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", bg)}>
              <Icon className={cn("w-3.5 h-3.5", color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
              {item.farmName && (
                <span className="text-xs text-green-500/60 mt-0.5 block">{item.farmName}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
              {ts ? formatRelativeTime(ts) : ""}
            </span>
          </div>
        );
      })}

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      )}
    </div>
  );
}
