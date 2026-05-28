"use client";
import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, BarChart2 } from "lucide-react";
import { listGEETasks } from "@/lib/integrations/gee-client";
import type { GEETask } from "@/types";

const STATUS_CONFIG = {
  COMPLETED: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
  RUNNING:   { icon: Clock,        color: "text-blue-400",  bg: "bg-blue-500/10" },
  PENDING:   { icon: Clock,        color: "text-yellow-400",bg: "bg-yellow-500/10" },
  FAILED:    { icon: AlertCircle,  color: "text-red-400",   bg: "bg-red-500/10" },
  CANCELLED: { icon: AlertCircle,  color: "text-slate-400", bg: "bg-slate-500/10" },
};

interface Props { state: string }

export function GEEAnalysisPanel({ state }: Props) {
  const [tasks] = useState<GEETask[]>(() =>
    listGEETasks(["r1f2a3", "b4c5d6", "e7f8g9", "h1i2j3"], state)
  );

  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const latest = completed[0]?.resultSummary;

  return (
    <div className="space-y-4">
      {latest && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-300">Latest GEE Composite — {latest.satellite}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { label: "Mean NDVI",    value: latest.meanNDVI.toFixed(4) },
              { label: "Cloud Free",   value: `${latest.cloudFreePct}%` },
              { label: "Area Covered", value: `${latest.areaCoveredKmSq.toLocaleString()} km²` },
              { label: "Median NDVI",  value: latest.medianNDVI.toFixed(4) },
              { label: "Std Dev",      value: latest.stdNDVI.toFixed(4) },
              { label: "Pixel Count",  value: latest.pixelCount.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-white/5 p-2">
                <p className="text-slate-400">{label}</p>
                <p className="font-medium text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Processing Queue</p>
        {tasks.map((task) => {
          const cfg = STATUS_CONFIG[task.status];
          const Icon = cfg.icon;
          return (
            <div key={task.taskId} className={`flex items-center gap-3 rounded-lg border p-3 ${cfg.bg} border-white/5`}>
              <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{task.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-slate-400">{task.satellite} · {task.region}</p>
              </div>
              {task.status === "RUNNING" && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${task.progressPct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{task.progressPct}%</span>
                </div>
              )}
              {task.status === "COMPLETED" && (
                <span className="text-xs text-green-400">Done</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
