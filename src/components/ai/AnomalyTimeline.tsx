"use client";

import { AlertTriangle, TrendingDown, TrendingUp, Activity, Zap, Shield } from "lucide-react";
import type { AnomalyDetection, AnomalyType } from "@/types";
import { anomalySeverityColor, anomalySeverityBg } from "@/lib/ai/anomaly-detector";

const TYPE_CONFIG: Record<AnomalyType, { label: string; icon: typeof AlertTriangle }> = {
  ndvi_collapse:       { label: "NDVI Collapse",       icon: TrendingDown },
  ndvi_spike:          { label: "NDVI Spike",           icon: TrendingUp },
  seasonal_deviation:  { label: "Seasonal Deviation",   icon: Activity },
  evidence_gap:        { label: "Evidence Gap",          icon: Shield },
  pattern_break:       { label: "Pattern Break",         icon: Zap },
};

interface AnomalyTimelineProps {
  detection: AnomalyDetection | null;
  loading?: boolean;
}

export function AnomalyTimeline({ detection, loading }: AnomalyTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0,1,2].map((i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (!detection) return null;

  const { anomalyCount, maxZScore, severity, events, overallConfidence } = detection;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${anomalySeverityBg(severity)}`}>
        <AlertTriangle className={`w-4 h-4 ${anomalySeverityColor(severity)}`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${anomalySeverityColor(severity)}`}>
            {anomalyCount === 0
              ? "No anomalies detected"
              : `${anomalyCount} anomal${anomalyCount === 1 ? "y" : "ies"} — ${severity} severity`}
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            Max Z-score: {maxZScore.toFixed(2)} · Detection confidence: {overallConfidence}%
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-4 rounded-xl bg-green-500/5 border border-green-500/15">
          <Shield className="w-4 h-4 text-green-400" />
          <p className="text-xs text-green-400">Vegetation patterns within expected seasonal range</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {events.map((event, i) => {
            const cfg = TYPE_CONFIG[event.type];
            const Icon = cfg.icon;
            const isNeg = event.deviation < 0;
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/20"
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isNeg ? "text-red-400" : "text-orange-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{event.month}</span>
                    <span className="text-[10px] text-muted-foreground/50">{cfg.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40">
                    NDVI {event.ndvi.toFixed(3)} · Expected ~{event.expected.toFixed(3)} · Z={event.zScore.toFixed(2)}
                  </p>
                </div>
                <span className={`text-xs font-semibold ${isNeg ? "text-red-400" : "text-orange-400"}`}>
                  {event.deviation > 0 ? "+" : ""}{(event.deviation * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
