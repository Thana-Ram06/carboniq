"use client";

import { TrendingUp, TrendingDown, CloudRain, Flame } from "lucide-react";
import type { VegetationForecast } from "@/types";

interface VegetationForecastChartProps {
  forecast: VegetationForecast | null;
  loading?: boolean;
}

export function VegetationForecastChart({ forecast, loading }: VegetationForecastChartProps) {
  if (loading) {
    return <div className="h-48 rounded-xl bg-muted animate-pulse" />;
  }
  if (!forecast) return null;

  const allPoints = [...forecast.history.slice(-6), ...forecast.forecast];
  const maxNDVI = Math.max(...allPoints.map((p) => p.upper));
  const minNDVI = Math.min(...allPoints.map((p) => p.lower));
  const range = maxNDVI - minNDVI || 0.1;

  function yPct(val: number): number {
    return 100 - ((val - minNDVI) / range) * 90 - 5;
  }

  const trendUp = forecast.trendSlope > 0.005;
  const trendDown = forecast.trendSlope < -0.005;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : TrendingUp;
  const trendColor = trendUp ? "text-green-400" : trendDown ? "text-red-400" : "text-yellow-400";

  return (
    <div className="space-y-3">
      {/* Trend indicators */}
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className="text-[11px] text-muted-foreground/60">
            {trendUp ? "Improving" : trendDown ? "Declining" : "Stable"} trend
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
          forecast.droughtProbability > 50 ? "bg-orange-500/10 border-orange-500/20" : "bg-muted/40 border-border"
        }`}>
          <CloudRain className={`w-3.5 h-3.5 ${forecast.droughtProbability > 50 ? "text-orange-400" : "text-muted-foreground/40"}`} />
          <span className="text-[11px] text-muted-foreground/60">Drought {forecast.droughtProbability}%</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
          forecast.stressProbability > 50 ? "bg-red-500/10 border-red-500/20" : "bg-muted/40 border-border"
        }`}>
          <Flame className={`w-3.5 h-3.5 ${forecast.stressProbability > 50 ? "text-red-400" : "text-muted-foreground/40"}`} />
          <span className="text-[11px] text-muted-foreground/60">Stress {forecast.stressProbability}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-36 bg-muted/20 rounded-xl border border-border overflow-hidden px-3 pt-2 pb-4">
        <svg className="w-full h-full" viewBox={`0 0 ${allPoints.length * 40} 100`} preserveAspectRatio="none">
          {/* Forecast uncertainty band */}
          {forecast.forecast.map((p, i) => {
            const histLen = allPoints.length - forecast.forecast.length;
            const x = (histLen + i) * 40;
            const w = 40;
            return (
              <rect
                key={`band-${i}`}
                x={x}
                y={yPct(p.upper)}
                width={w}
                height={Math.max(2, yPct(p.lower) - yPct(p.upper))}
                fill="rgba(99,102,241,0.08)"
              />
            );
          })}

          {/* History line */}
          <polyline
            points={forecast.history.slice(-6).map((p, i) => `${i * 40 + 20},${yPct(p.ndvi)}`).join(" ")}
            fill="none"
            stroke="rgb(74,222,128)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Forecast line (dashed) */}
          <polyline
            points={forecast.forecast.map((p, i) => {
              const histLen = allPoints.length - forecast.forecast.length;
              return `${(histLen + i) * 40 + 20},${yPct(p.ndvi)}`;
            }).join(" ")}
            fill="none"
            stroke="rgb(99,102,241)"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Dots */}
          {allPoints.map((p, i) => (
            <circle
              key={i}
              cx={i * 40 + 20}
              cy={yPct(p.ndvi)}
              r="3"
              fill={p.isForecast ? "rgb(99,102,241)" : "rgb(74,222,128)"}
              opacity="0.9"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-3 right-3 flex justify-between">
          {allPoints.map((p, i) => (
            <span key={i} className={`text-[9px] ${p.isForecast ? "text-violet-400/60" : "text-muted-foreground/30"}`}>
              {p.month.slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      {/* Forecast values */}
      <div className="grid grid-cols-3 gap-2">
        {forecast.forecast.map((p) => (
          <div key={p.month} className="p-2 rounded-xl bg-violet-500/8 border border-violet-500/15 text-center">
            <p className="text-xs font-bold text-violet-300">{p.ndvi.toFixed(3)}</p>
            <p className="text-[10px] text-muted-foreground/50">{p.month}</p>
            <p className="text-[9px] text-violet-400/40">{p.lower.toFixed(2)}–{p.upper.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
