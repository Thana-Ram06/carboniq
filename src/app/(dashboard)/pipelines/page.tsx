"use client";
import { Activity } from "lucide-react";
import { PipelineMonitor } from "@/components/pipelines/PipelineMonitor";
import { DroughtForecastPanel } from "@/components/forecast/DroughtForecastPanel";

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-2.5">
          <Activity className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Data Pipelines</h1>
          <p className="text-sm text-slate-400">Async processing, infrastructure status, and pipeline observability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <p className="text-sm font-semibold text-white mb-4">Pipeline Monitor</p>
          <PipelineMonitor />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/3 p-4">
            <p className="text-sm font-semibold text-white mb-4">Drought Early Warning</p>
            <DroughtForecastPanel regionName="Pune" state="Maharashtra" avgNDVI={0.52} />
          </div>
          <div className="rounded-xl border border-white/5 bg-white/3 p-4">
            <p className="text-sm font-semibold text-white mb-4">Drought Early Warning</p>
            <DroughtForecastPanel regionName="Jaipur" state="Rajasthan" avgNDVI={0.36} />
          </div>
        </div>
      </div>
    </div>
  );
}
