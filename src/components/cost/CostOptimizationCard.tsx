"use client";
import { TrendingDown, Zap, AlertCircle } from "lucide-react";
import type { CostOptimization } from "@/types";
import { getCostOptimizations } from "@/lib/cost/cost-tracker";

const PRIORITY_CONFIG = {
  critical: { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    label: "Critical" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "High" },
  medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Medium" },
  low:      { color: "text-slate-400",  bg: "bg-slate-700/30",  border: "border-slate-700",     label: "Low" },
};

const EFFORT_CONFIG = {
  low:    { color: "text-green-400",  label: "Low effort" },
  medium: { color: "text-yellow-400", label: "Med effort" },
  high:   { color: "text-red-400",    label: "High effort" },
};

const CATEGORY_LABELS: Record<CostOptimization["category"], string> = {
  firestore_reads:  "Firestore Reads",
  firestore_writes: "Firestore Writes",
  storage:          "Storage",
  functions:        "Functions",
  egress:           "Egress",
  satellite_api:    "Satellite API",
};

export function CostOptimizationCard() {
  const optimizations = getCostOptimizations();
  const totalSaving = optimizations.reduce((s, o) => s + o.estimatedSavingUSD, 0);
  const critical = optimizations.filter((o) => o.priority === "critical").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-sm font-semibold text-white">Total Potential Savings</p>
            <p className="text-xs text-slate-400">{optimizations.length} optimizations identified</p>
          </div>
        </div>
        <p className="text-xl font-bold text-green-400">${totalSaving.toFixed(2)}/mo</p>
      </div>

      {critical > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{critical} critical optimization{critical > 1 ? "s" : ""} require immediate action</p>
        </div>
      )}

      <div className="space-y-2">
        {optimizations.map((opt) => {
          const priCfg = PRIORITY_CONFIG[opt.priority];
          const effortCfg = EFFORT_CONFIG[opt.effort];
          return (
            <div key={opt.id} className={`rounded-xl border p-4 ${priCfg.bg} ${priCfg.border}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Zap className={`h-4 w-4 shrink-0 ${priCfg.color}`} />
                  <span className="text-xs font-medium text-slate-400">{CATEGORY_LABELS[opt.category]}</span>
                  <span className={`rounded-full border px-2 text-[10px] uppercase font-medium ${priCfg.color} ${priCfg.border}`}>
                    {priCfg.label}
                  </span>
                  <span className={`text-[10px] ${effortCfg.color}`}>{effortCfg.label}</span>
                </div>
                <span className="text-sm font-bold text-green-400 whitespace-nowrap">−${opt.estimatedSavingUSD}/mo</span>
              </div>
              <p className="text-xs text-white font-medium mb-1">{opt.issue}</p>
              <p className="text-xs text-slate-400">{opt.recommendation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
