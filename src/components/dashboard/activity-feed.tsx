"use client";

import {
  MapPin,
  BarChart3,
  FileText,
  Satellite,
  Leaf,
  RefreshCw,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/types";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS = {
  farm_added: { Icon: MapPin, color: "text-green-400", bg: "bg-green-500/10" },
  analysis_complete: {
    Icon: Satellite,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  report_generated: {
    Icon: FileText,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  ndvi_update: {
    Icon: Leaf,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  carbon_estimated: {
    Icon: BarChart3,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
};

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "farm_added",
    title: "New farm added",
    description: "Rampur Agricultural Plot — 12.4 ha",
    timestamp: { seconds: Date.now() / 1000 - 3600 } as never,
    farmName: "Rampur Agricultural Plot",
  },
  {
    id: "2",
    type: "ndvi_update",
    title: "NDVI analysis updated",
    description: "Vegetation index: 0.68 — Healthy",
    timestamp: { seconds: Date.now() / 1000 - 7200 } as never,
    farmName: "Krishnanagar Farm",
  },
  {
    id: "3",
    type: "carbon_estimated",
    title: "Carbon score calculated",
    description: "Score: 72 · Est. 18.4 tCO₂e",
    timestamp: { seconds: Date.now() / 1000 - 18000 } as never,
    farmName: "Punjab Wheat Field",
  },
  {
    id: "4",
    type: "report_generated",
    title: "Report generated",
    description: "Q4 2024 Sustainability Summary",
    timestamp: { seconds: Date.now() / 1000 - 86400 } as never,
  },
  {
    id: "5",
    type: "analysis_complete",
    title: "Satellite pass complete",
    description: "Sentinel-2 capture — cloud cover 4%",
    timestamp: { seconds: Date.now() / 1000 - 172800 } as never,
    farmName: "Maharashtra Cotton Field",
  },
];

interface ActivityFeedProps {
  items?: ActivityItem[];
  loading?: boolean;
  className?: string;
}

export function ActivityFeed({
  items = MOCK_ACTIVITY,
  loading = false,
  className,
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

  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, i) => {
        const config =
          ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.farm_added;
        const { Icon, color, bg } = config;

        return (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 py-3.5",
              i < items.length - 1 && "border-b border-border"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                bg
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {item.description}
              </p>
              {item.farmName && (
                <span className="text-xs text-green-500/60 mt-0.5 block">
                  {item.farmName}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
        );
      })}

      <button className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto">
        <RefreshCw className="w-3 h-3" />
        Refresh
      </button>
    </div>
  );
}
