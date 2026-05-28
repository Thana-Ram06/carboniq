"use client";

import { useMemo } from "react";
import { MapPin, TrendingUp, AlertTriangle, Leaf, BarChart3 } from "lucide-react";
import type { Farm, DistrictIntelligence } from "@/types";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { detectAnomalies } from "@/lib/ai/anomaly-detector";
import { predictYield } from "@/lib/ai/yield-predictor";

interface RegionalIntelligenceMapProps {
  farms: Farm[];
}

export function RegionalIntelligenceMap({ farms }: RegionalIntelligenceMapProps) {
  const districts = useMemo<DistrictIntelligence[]>(() => {
    const map: Record<string, {
      farmCount: number; ndviSum: number; carbonSum: number;
      anomalies: number; yieldSum: number; crops: Record<string, number>;
      healthSum: number;
    }> = {};

    farms.forEach((farm) => {
      const key = (farm as Farm & { district?: string }).district ?? farm.state ?? "Unknown";
      if (!map[key]) {
        map[key] = { farmCount: 0, ndviSum: 0, carbonSum: 0, anomalies: 0, yieldSum: 0, crops: {}, healthSum: 0 };
      }
      const e = map[key];
      e.farmCount++;

      const ndviResult = computeFarmNDVI({
        farmId: farm.id, cropType: farm.cropType,
        irrigationType: farm.irrigationType, state: farm.state, areaHectares: farm.areaHectares,
      });
      const ndvi = ndviResult.current.ndvi;
      e.ndviSum += ndvi;

      const carbon = computeCarbonIntelligence(farm, ndvi);
      e.carbonSum += carbon.carbonScoreTonnes;

      const anomaly = detectAnomalies({
        farmId: farm.id, userId: farm.userId, cropType: farm.cropType,
        irrigationType: farm.irrigationType, state: farm.state, areaHectares: farm.areaHectares,
      });
      if (anomaly.anomalyCount > 0) e.anomalies++;

      const yf = predictYield({
        farmId: farm.id, userId: farm.userId, cropType: farm.cropType,
        irrigationType: farm.irrigationType, state: farm.state, areaHectares: farm.areaHectares,
      });
      e.yieldSum += yf.predictedYieldTonnesHa;
      e.crops[farm.cropType] = (e.crops[farm.cropType] ?? 0) + 1;
      e.healthSum += ndvi * 100;
    });

    return Object.entries(map).map(([key, e]) => {
      const dominantCrop = (Object.entries(e.crops).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other") as import("@/types").CropType;
      return {
        district: key,
        state: farms.find((f) => ((f as Farm & { district?: string }).district ?? f.state) === key)?.state ?? key,
        farmCount: e.farmCount,
        avgNDVI: parseFloat((e.ndviSum / e.farmCount).toFixed(4)),
        avgCarbon: parseFloat((e.carbonSum / e.farmCount).toFixed(2)),
        anomalyRate: Math.round((e.anomalies / e.farmCount) * 100),
        avgYieldTha: parseFloat((e.yieldSum / e.farmCount).toFixed(2)),
        dominantCrop,
        healthScore: Math.round(e.healthSum / e.farmCount),
      };
    }).sort((a, b) => b.farmCount - a.farmCount);
  }, [farms]);

  if (farms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <MapPin className="w-8 h-8 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground/50">Add farms to see regional intelligence</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {districts.slice(0, 8).map((d) => (
        <div
          key={d.district}
          className="p-3 rounded-xl border border-border bg-muted/30 hover:border-green-500/15 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-green-400/70" />
              <p className="text-xs font-semibold text-foreground">{d.district}</p>
              <span className="text-[10px] text-muted-foreground/40">({d.state})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/40">{d.farmCount} farm{d.farmCount !== 1 ? "s" : ""}</span>
              {d.anomalyRate > 30 && (
                <div className="flex items-center gap-1 text-[10px] text-orange-400">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {d.anomalyRate}% anomaly
                </div>
              )}
            </div>
          </div>

          {/* Health bar */}
          <div className="h-1 rounded-full bg-muted overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500/50 to-emerald-400/70"
              style={{ width: `${Math.min(100, d.healthScore)}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="flex items-center gap-1 text-muted-foreground/50">
              <Leaf className="w-2.5 h-2.5 text-green-400" />
              <span>{d.avgNDVI.toFixed(3)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground/50">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
              <span>{d.avgCarbon.toFixed(1)}t</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground/50">
              <BarChart3 className="w-2.5 h-2.5 text-blue-400" />
              <span>{d.avgYieldTha}t/ha</span>
            </div>
            <div className="text-right text-muted-foreground/40 capitalize">{d.dominantCrop}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
