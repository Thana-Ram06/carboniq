"use client";
import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, MapPin } from "lucide-react";
import { getRegionalScanHistory } from "@/lib/regional/district-processor";

const STATUS_CFG = {
  completed:  { icon: CheckCircle, color: "text-green-400" },
  processing: { icon: Clock,       color: "text-blue-400" },
  queued:     { icon: Clock,       color: "text-yellow-400" },
  failed:     { icon: AlertCircle, color: "text-red-400" },
};

interface Props { state: string }

export function RegionalProcessingQueue({ state }: Props) {
  const [jobs] = useState(() => getRegionalScanHistory(state));

  const counts = {
    completed: jobs.filter((j) => j.status === "completed").length,
    processing: jobs.filter((j) => j.status === "processing").length,
    queued: jobs.filter((j) => j.status === "queued").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 text-xs">
        {(["completed", "processing", "queued", "failed"] as const).map((s) => {
          const cfg = STATUS_CFG[s];
          const Icon = cfg.icon;
          return (
            <div key={s} className="rounded-lg border border-white/5 bg-white/3 p-2 text-center">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${cfg.color}`} />
              <p className="font-semibold text-white">{counts[s]}</p>
              <p className="text-slate-400 capitalize">{s}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {jobs.map((job) => {
          const cfg = STATUS_CFG[job.status];
          const Icon = cfg.icon;
          return (
            <div key={job.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 p-3">
              <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <p className="text-sm font-medium text-white truncate">{job.regionName}</p>
                  <span className="text-xs text-slate-500 capitalize">({job.scope})</span>
                </div>
                <p className="text-xs text-slate-400">{job.farmCount} farms · {job.id}</p>
              </div>
              {job.status === "processing" && (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-1.5 w-16 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${job.progressPct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{job.progressPct}%</span>
                </div>
              )}
              {job.status === "completed" && (
                <span className="text-xs text-green-400 shrink-0">Done</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
