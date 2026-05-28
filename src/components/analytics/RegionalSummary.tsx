"use client";

import { useMemo } from "react";
import { MapPin, TrendingUp, AlertTriangle, Leaf } from "lucide-react";
import type { Farm } from "@/types";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { assessRisk } from "@/lib/monitoring/risk-engine";

interface StateMetrics {
  state: string;
  farmCount: number;
  totalArea: number;
  avgNDVI: number;
  totalCarbon: number;
  riskCount: number;
}

interface RegionalSummaryProps {
  farms: Farm[];
}

export function RegionalSummary({ farms }: RegionalSummaryProps) {
  const stateMap = useMemo<StateMetrics[]>(() => {
    const map: Record<string, StateMetrics> = {};

    farms.forEach((farm) => {
      const state = farm.state || "Unknown";
      if (!map[state]) {
        map[state] = { state, farmCount: 0, totalArea: 0, avgNDVI: 0, totalCarbon: 0, riskCount: 0 };
      }
      const s = map[state];
      s.farmCount += 1;
      s.totalArea += farm.areaHectares;

      const ndviResult = computeFarmNDVI({
        farmId: farm.id,
        cropType: farm.cropType,
        irrigationType: farm.irrigationType,
        state: farm.state,
        areaHectares: farm.areaHectares,
      });
      const ndvi = ndviResult.current.ndvi;
      s.avgNDVI = (s.avgNDVI * (s.farmCount - 1) + ndvi) / s.farmCount;

      const carbon = computeCarbonIntelligence(farm, ndvi);
      s.totalCarbon += carbon.carbonScoreTonnes;

      const risk = assessRisk(farm, ndvi, null);
      if (risk.severity === "high" || risk.severity === "critical") s.riskCount += 1;
    });

    return Object.values(map).sort((a, b) => b.totalArea - a.totalArea);
  }, [farms]);

  if (stateMap.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <MapPin className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground/50">Add farms to see regional intelligence</p>
      </div>
    );
  }

  const maxArea = Math.max(...stateMap.map((s) => s.totalArea));

  return (
    <div className="space-y-2">
      {stateMap.slice(0, 8).map((state) => (
        <div
          key={state.state}
          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/40 hover:border-green-500/15 transition-all"
        >
          {/* State label */}
          <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5 text-green-400" />
          </div>

          {/* Data */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-foreground truncate">{state.state}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 shrink-0">
                <span>{state.farmCount} farm{state.farmCount !== 1 ? "s" : ""}</span>
                {state.riskCount > 0 && (
                  <span className="flex items-center gap-0.5 text-orange-400">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {state.riskCount}
                  </span>
                )}
              </div>
            </div>
            {/* Area bar */}
            <div className="h-1 rounded-full bg-muted overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-green-400/60"
                style={{ width: `${(state.totalArea / maxArea) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
              <span className="flex items-center gap-1">
                <Leaf className="w-2.5 h-2.5 text-green-400" />
                NDVI {state.avgNDVI.toFixed(3)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                {state.totalCarbon.toFixed(1)}t CO₂e
              </span>
              <span>{state.totalArea.toFixed(1)} ha</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
