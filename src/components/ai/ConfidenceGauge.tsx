"use client";

import { Shield, AlertCircle, Info } from "lucide-react";
import type { ConfidenceModel } from "@/types";

const GRADE_CONFIG = {
  high:         { color: "text-green-400",  bg: "bg-green-500/15 border-green-500/25",  stroke: "#4ade80", label: "Verification-Grade" },
  medium:       { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", stroke: "#facc15", label: "Monitoring-Grade" },
  low:          { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", stroke: "#fb923c", label: "Indicative Only" },
  insufficient: { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",      stroke: "#f87171", label: "Insufficient Data" },
} as const;

interface ConfidenceGaugeProps {
  model: ConfidenceModel | null;
  loading?: boolean;
  compact?: boolean;
}

export function ConfidenceGauge({ model, loading, compact }: ConfidenceGaugeProps) {
  if (loading) return <div className="h-40 rounded-2xl bg-muted animate-pulse" />;
  if (!model) return null;

  const cfg = GRADE_CONFIG[model.grade];
  const score = model.overallConfidence;

  // SVG arc gauge
  const R = 42;
  const circumference = Math.PI * R;
  const filled = (score / 100) * circumference;

  return (
    <div className="space-y-3">
      {/* Gauge */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width="90" height="52" viewBox="0 0 90 52">
            {/* Background arc */}
            <path
              d="M 5 47 A 42 42 0 0 1 85 47"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Filled arc */}
            <path
              d="M 5 47 A 42 42 0 0 1 85 47"
              fill="none"
              stroke={cfg.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
              opacity="0.85"
            />
            <text x="45" y="44" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
              {score}%
            </text>
          </svg>
        </div>
        <div>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
            <Shield className="w-3 h-3" />
            {cfg.label}
          </div>
          <p className="text-[11px] text-muted-foreground/50 mt-1">
            Uncertainty: ±{model.uncertainty}%
          </p>
        </div>
      </div>

      {!compact && (
        <>
          {/* Sources breakdown */}
          <div className="space-y-1.5">
            {model.sources.map((src) => (
              <div key={src.source} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/50 w-36 flex-shrink-0">{src.source}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${src.score}%`,
                      backgroundColor: src.score >= 70 ? "#4ade80" : src.score >= 45 ? "#facc15" : "#f87171",
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/60 w-8 text-right">{src.score}%</span>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className={`flex items-start gap-2 p-2.5 rounded-xl border ${cfg.bg}`}>
            {model.grade === "high" ? (
              <Shield className={`w-3.5 h-3.5 mt-0.5 ${cfg.color}`} />
            ) : model.grade === "insufficient" ? (
              <AlertCircle className={`w-3.5 h-3.5 mt-0.5 ${cfg.color}`} />
            ) : (
              <Info className={`w-3.5 h-3.5 mt-0.5 ${cfg.color}`} />
            )}
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{model.recommendation}</p>
          </div>
        </>
      )}
    </div>
  );
}
