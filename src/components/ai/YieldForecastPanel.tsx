"use client";

import { TrendingUp, TrendingDown, Minus, BarChart3, MapPin } from "lucide-react";
import type { YieldForecast } from "@/types";

interface YieldForecastPanelProps {
  forecast: YieldForecast | null;
  loading?: boolean;
}

export function YieldForecastPanel({ forecast, loading }: YieldForecastPanelProps) {
  if (loading) {
    return <div className="h-40 rounded-2xl bg-muted animate-pulse" />;
  }
  if (!forecast) return null;

  const delta = forecast.performanceVsBenchmark;
  const TrendIcon = delta > 5 ? TrendingUp : delta < -5 ? TrendingDown : Minus;
  const trendColor = delta > 5 ? "text-green-400" : delta < -5 ? "text-red-400" : "text-yellow-400";
  const trendBg = delta > 5 ? "bg-green-500/10 border-green-500/20" : delta < -5 ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20";

  const metrics = [
    { label: "Predicted Yield", value: `${forecast.predictedYieldTonnesHa} t/ha`, icon: BarChart3 },
    { label: "Total Production", value: `${forecast.totalProductionTonnes} t`, icon: TrendingUp },
    { label: "Benchmark Yield", value: `${forecast.benchmarkYieldTonnesHa} t/ha`, icon: MapPin },
  ];

  return (
    <div className="space-y-3">
      {/* Performance vs benchmark */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${trendBg}`}>
        <TrendIcon className={`w-5 h-5 ${trendColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-bold ${trendColor}`}>
            {delta > 0 ? "+" : ""}{delta}% vs district benchmark
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            {forecast.forecastSeason} · Confidence {forecast.yieldConfidence}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{forecast.predictedYieldTonnesHa}</p>
          <p className="text-[10px] text-muted-foreground/40">t/ha</p>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-3 gap-2">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-2.5 rounded-xl bg-muted/30 border border-border">
            <Icon className="w-3.5 h-3.5 text-muted-foreground/40 mb-1.5" />
            <p className="text-xs font-semibold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground/50 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-muted-foreground/60">Forecast confidence</span>
          <span className="text-foreground font-medium">{forecast.yieldConfidence}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400/70"
            style={{ width: `${forecast.yieldConfidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
