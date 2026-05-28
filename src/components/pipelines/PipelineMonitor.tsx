"use client";
import { useState } from "react";
import { Activity, CheckCircle, AlertCircle, Clock, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { getActivePipelineJobs, getPipelineMetrics, getInfrastructureStatus } from "@/lib/pipeline/pipeline-engine";
import type { PipelineJob, PipelineStage } from "@/types";

const STAGE_LABELS: Record<PipelineStage, string> = {
  ingest: "Ingest", validate: "Validate", transform: "Transform",
  compute: "Compute", store: "Store", notify: "Notify",
};

const STATUS_DOT = {
  idle:      "bg-slate-600",
  running:   "bg-blue-400 animate-pulse",
  completed: "bg-green-400",
  failed:    "bg-red-400",
  retrying:  "bg-yellow-400",
};

const JOB_STATUS_CONFIG = {
  idle:      { icon: Clock,        color: "text-slate-400" },
  running:   { icon: RefreshCw,    color: "text-blue-400" },
  completed: { icon: CheckCircle,  color: "text-green-400" },
  failed:    { icon: AlertCircle,  color: "text-red-400" },
  retrying:  { icon: RefreshCw,    color: "text-yellow-400" },
};

export function PipelineMonitor() {
  const [jobs] = useState(getActivePipelineJobs);
  const [metrics] = useState(getPipelineMetrics);
  const [infra] = useState(getInfrastructureStatus);
  const [expanded, setExpanded] = useState<string | null>(null);

  const pct = (job: PipelineJob) =>
    job.itemsTotal > 0 ? Math.round((job.itemsProcessed / job.itemsTotal) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          { label: "Throughput",    value: `${metrics.avgThroughputPerMin}/min` },
          { label: "P50 Latency",   value: `${metrics.p50LatencyMs}ms` },
          { label: "Success Rate",  value: `${metrics.successRate}%` },
          { label: "Jobs Today",    value: metrics.totalJobsToday },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-white/5 bg-white/3 p-2 text-center">
            <p className="text-slate-400">{label}</p>
            <p className="font-semibold text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Infrastructure Status */}
      <div className={`rounded-xl border p-3 ${
        infra.overallStatus === "operational" ? "border-green-500/20 bg-green-500/5" :
        infra.overallStatus === "degraded" ? "border-yellow-500/20 bg-yellow-500/5" :
        "border-red-500/20 bg-red-500/5"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${infra.overallStatus === "operational" ? "text-green-400" : "text-yellow-400"}`} />
            <p className="text-sm font-semibold text-white capitalize">{infra.overallStatus}</p>
          </div>
          <p className="text-xs text-slate-400">Uptime: {infra.uptimePct30d}% (30d)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(infra.components).map(([component, status]) => (
            <div key={component} className="flex items-center gap-1.5 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${status === "up" ? "bg-green-400" : status === "degraded" ? "bg-yellow-400" : "bg-red-400"}`} />
              <span className="text-slate-300 capitalize">{component}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs */}
      <div className="space-y-2">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Pipeline Jobs</p>
        {jobs.map((job) => {
          const cfg = JOB_STATUS_CONFIG[job.status];
          const Icon = cfg.icon;
          const isOpen = expanded === job.id;
          const progress = pct(job);

          return (
            <div key={job.id} className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : job.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/2 transition-colors"
              >
                <Icon className={`h-4 w-4 shrink-0 ${cfg.color} ${job.status === "running" ? "animate-spin" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{job.name}</p>
                  <p className="text-xs text-slate-400">
                    {job.itemsProcessed.toLocaleString()} / {job.itemsTotal.toLocaleString()} items
                    {job.retryCount > 0 && <span className="text-yellow-400 ml-2">· retry #{job.retryCount}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {job.status === "running" && (
                    <>
                      <div className="h-1.5 w-20 rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{progress}%</span>
                    </>
                  )}
                  {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-3 border-t border-white/5">
                  <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
                    {(["ingest", "validate", "transform", "compute", "store", "notify"] as PipelineStage[]).map((stage) => {
                      const s = job.stages[stage];
                      return (
                        <div key={stage} className="flex flex-col items-center gap-1 min-w-[60px]">
                          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s.status]}`} />
                          <span className="text-xs text-slate-400">{STAGE_LABELS[stage]}</span>
                          {s.durationMs && (
                            <span className="text-xs text-slate-500">{s.durationMs}ms</span>
                          )}
                          {s.error && (
                            <span className="text-xs text-red-400 text-center">Error</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Triggered by: <span className="capitalize text-slate-300">{job.triggeredBy}</span>
                    {" · "}Started: {new Date(job.startedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
