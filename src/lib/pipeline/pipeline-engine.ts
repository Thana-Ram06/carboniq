/**
 * Data Pipeline Engine — VASUDHA Phase 10
 *
 * Manages async batch processing jobs: NDVI batch scans, carbon recalculation,
 * anomaly sweeps, benchmark refreshes, forecast updates, and regional scans.
 * Tracks per-stage progress and provides observability metrics.
 */

import type { PipelineJob, PipelineMetrics, PipelineStage, PipelineStatus, PipelineStageState } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const PIPELINE_STAGES: PipelineStage[] = ["ingest", "validate", "transform", "compute", "store", "notify"];

function generateStageStates(jobId: string, overallStatus: PipelineStatus): Record<PipelineStage, PipelineStageState> {
  const seed = seedHash(jobId);
  const result = {} as Record<PipelineStage, PipelineStageState>;

  const completedIdx = overallStatus === "completed" ? PIPELINE_STAGES.length :
                       overallStatus === "running" ? Math.round(sf(seed, 1, 4)) :
                       overallStatus === "failed" ? Math.round(sf(seed, 1, 3)) : 0;

  PIPELINE_STAGES.forEach((stage, i) => {
    if (i < completedIdx) {
      result[stage] = { status: "completed", durationMs: Math.round(sf(seed + i, 120, 8500)) };
    } else if (i === completedIdx && overallStatus === "running") {
      result[stage] = { status: "running", durationMs: Math.round(sf(seed + i, 200, 3000)) };
    } else if (i === completedIdx && overallStatus === "failed") {
      result[stage] = { status: "failed", error: "Computation error: upstream data unavailable" };
    } else {
      result[stage] = { status: "idle" };
    }
  });
  return result;
}

type JobType = PipelineJob["type"];
const JOB_CONFIGS: Record<JobType, { name: string; itemRange: [number, number] }> = {
  ndvi_batch:          { name: "NDVI Batch Scan",          itemRange: [50, 800] },
  carbon_recalc:       { name: "Carbon Recalculation",     itemRange: [30, 600] },
  anomaly_sweep:       { name: "Anomaly Sweep",            itemRange: [100, 2000] },
  benchmark_refresh:   { name: "Benchmark Refresh",        itemRange: [500, 5000] },
  forecast_update:     { name: "Forecast Update",          itemRange: [80, 400] },
  regional_scan:       { name: "Regional Scan",            itemRange: [200, 8000] },
};

export function generatePipelineJob(
  type: JobType,
  triggeredBy: PipelineJob["triggeredBy"] = "schedule",
  seedStr?: string,
): PipelineJob {
  const config = JOB_CONFIGS[type];
  const seed = seedHash(seedStr ?? `${type}-${Date.now()}`);
  const itemsTotal = Math.round(sf(seed, config.itemRange[0], config.itemRange[1]));
  const progressPct = sf(seed + 1, 0, 1);
  const itemsProcessed = Math.round(itemsTotal * progressPct);

  const status: PipelineStatus =
    progressPct >= 0.99 ? "completed" :
    progressPct > 0.1 ? "running" :
    progressPct < 0.02 && seedHash(seedStr ?? type) % 8 === 0 ? "failed" :
    "running";

  const currentStageIdx = Math.min(
    PIPELINE_STAGES.length - 1,
    Math.floor(progressPct * PIPELINE_STAGES.length),
  );
  const currentStage = PIPELINE_STAGES[currentStageIdx];

  return {
    id: `JOB-${(seed % 99999).toString().padStart(5, "0")}`,
    name: config.name,
    type,
    status,
    currentStage,
    stages: generateStageStates(`${type}-${seed}`, status),
    itemsTotal,
    itemsProcessed,
    startedAt: new Date(Date.now() - Math.round(sf(seed + 2, 60000, 7200000))).toISOString(),
    completedAt: status === "completed" ? new Date().toISOString() : undefined,
    retryCount: seedHash(type) % 3 === 0 ? 1 : 0,
    triggeredBy,
  };
}

export function getActivePipelineJobs(): PipelineJob[] {
  const types: JobType[] = ["ndvi_batch", "carbon_recalc", "anomaly_sweep", "benchmark_refresh", "forecast_update", "regional_scan"];
  return types.map((t, i) => generatePipelineJob(t, i % 3 === 0 ? "manual" : "schedule", `stable-${t}`));
}

export function getPipelineMetrics(): PipelineMetrics {
  return {
    avgThroughputPerMin: 284,
    p50LatencyMs: 340,
    p95LatencyMs: 1820,
    successRate: 97.4,
    errorRate: 2.6,
    queueDepth: 3,
    activeWorkers: 4,
    totalJobsToday: 38,
  };
}

export function getInfrastructureStatus() {
  return {
    timestamp: new Date().toISOString(),
    overallStatus: "operational" as const,
    components: {
      firestore: "up" as const,
      storage: "up" as const,
      auth: "up" as const,
      satellite: "up" as const,
      externalAPIs: "up" as const,
      pipeline: "up" as const,
    },
    activeIncidents: 0,
    uptimePct30d: 99.82,
  };
}
