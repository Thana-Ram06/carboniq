"use client";

import { Award, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { BenchmarkData } from "@/types";
import { percentileColor, deltaLabel } from "@/lib/analytics/benchmarking";

interface BenchmarkPanelProps {
  data: BenchmarkData | null;
  loading?: boolean;
}

export function BenchmarkPanel({ data, loading }: BenchmarkPanelProps) {
  if (loading) return <div className="h-48 rounded-2xl bg-muted animate-pulse" />;
  if (!data) return null;

  return (
    <div className="space-y-3">
      {/* Overall percentile */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Award className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {data.overallPercentile}th percentile
          </p>
          <p className="text-[11px] text-muted-foreground/50">
            vs district average · Best: {data.standoutMetric}
          </p>
        </div>
        <div className={`text-2xl font-black ${percentileColor(data.overallPercentile)}`}>
          {data.overallPercentile}
          <span className="text-sm font-normal text-muted-foreground/50">%ile</span>
        </div>
      </div>

      {/* Metric comparisons */}
      <div className="space-y-2">
        {data.comparisons.map((comp) => {
          const DeltaIcon = comp.delta > 0 ? ArrowUp : comp.delta < 0 ? ArrowDown : Minus;
          const deltaColor = comp.delta > 0 ? "text-green-400" : comp.delta < 0 ? "text-red-400" : "text-yellow-400";

          return (
            <div key={comp.metric} className="p-3 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">{comp.metric}</span>
                <div className="flex items-center gap-1">
                  <DeltaIcon className={`w-3 h-3 ${deltaColor}`} />
                  <span className={`text-[11px] font-semibold ${deltaColor}`}>
                    {deltaLabel(comp.delta)}
                  </span>
                </div>
              </div>
              {/* Mini bar comparison */}
              <div className="space-y-1">
                {[
                  { label: "Farm",     val: comp.farmValue,    color: "#4ade80" },
                  { label: "District", val: comp.districtAvg,  color: "#818cf8" },
                  { label: "State",    val: comp.stateAvg,     color: "#a78bfa" },
                ].map(({ label, val, color }) => {
                  const maxVal = Math.max(comp.farmValue, comp.stateAvg, comp.nationalAvg);
                  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground/40 w-12">{label}</span>
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.65 }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 w-12 text-right font-mono">{val}</span>
                    </div>
                  );
                })}
              </div>
              <p className={`text-[10px] mt-1 ${percentileColor(comp.percentile)}`}>
                {comp.percentile}th percentile in district
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
