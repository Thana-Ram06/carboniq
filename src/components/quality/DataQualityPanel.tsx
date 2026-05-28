"use client";

import { useMemo } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { Farm } from "@/types";
import { computeDataQuality, qualityColor, qualityBg } from "@/lib/quality/data-quality-engine";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";

interface DataQualityPanelProps {
  farms: Farm[];
}

export function DataQualityPanel({ farms }: DataQualityPanelProps) {
  const qualityScores = useMemo(() => {
    return farms.map((farm) => {
      const ndviResult = computeFarmNDVI({
        farmId: farm.id,
        cropType: farm.cropType,
        irrigationType: farm.irrigationType,
        state: farm.state,
        areaHectares: farm.areaHectares,
      });
      const history = [
        ndviResult.current.ndvi,
        ndviResult.current.ndvi * 0.92,
        ndviResult.current.ndvi * 1.05,
      ];
      return {
        farm,
        quality: computeDataQuality({
          farm,
          evidenceCount: Math.floor(Math.random() * 5),
          auditApproved: Math.random() > 0.4,
          ndviHistory: history,
          hasBoundary: !!farm.boundary,
        }),
      };
    });
  }, [farms]);

  if (farms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <ShieldCheck className="w-8 h-8 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground/50">Add farms to see quality scores</p>
      </div>
    );
  }

  const avgScore = Math.round(
    qualityScores.reduce((s, q) => s + q.quality.overallScore, 0) / qualityScores.length
  );
  const issues = qualityScores.filter((q) => q.quality.overallScore < 60).length;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-3 py-2 rounded-xl border border-border bg-muted/30">
        <ShieldCheck className="w-4 h-4 text-green-400" />
        <div className="flex-1">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-muted-foreground/60">Avg Quality Score</span>
            <span className="font-semibold text-foreground">{avgScore}/100</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-400/70 transition-all"
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>
        {issues > 0 && (
          <div className="flex items-center gap-1 text-orange-400 text-[11px]">
            <AlertTriangle className="w-3 h-3" />
            <span>{issues} issues</span>
          </div>
        )}
      </div>

      {/* Per-farm list */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto">
        {qualityScores
          .sort((a, b) => a.quality.overallScore - b.quality.overallScore)
          .map(({ farm, quality }) => (
            <div
              key={farm.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${qualityBg(quality.grade)} transition-all`}
            >
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${qualityBg(quality.grade)} flex-shrink-0`}>
                <span className={`text-sm font-bold ${qualityColor(quality.grade)}`}>{quality.grade}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{farm.name}</p>
                <div className="flex gap-3 text-[10px] text-muted-foreground/50 mt-0.5">
                  <span>NDVI {quality.ndviConsistency}%</span>
                  <span>Evidence {quality.evidenceCompleteness}%</span>
                  <span>Audit {quality.auditCoverage}%</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${qualityColor(quality.grade)}`}>{quality.overallScore}</p>
                {quality.flags.length > 0 ? (
                  <XCircle className="w-3 h-3 text-orange-400/60 ml-auto" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-green-400/60 ml-auto" />
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
