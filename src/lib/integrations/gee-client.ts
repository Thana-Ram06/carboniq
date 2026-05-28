/**
 * Google Earth Engine Integration Layer — VASUDHA Phase 10
 *
 * Simulates GEE Earth Engine API responses with realistic satellite imagery
 * data derived from NDVI engine baselines. In production, replace the
 * computeXxx functions with actual GEE REST API / Earth Engine JS calls.
 *
 * GEE REST API: https://earthengine.googleapis.com/v1alpha
 */

import type { GEETask, GEEVegetationComposite, GEESatellite } from "@/types";

const TASK_TYPES = ["NDVI_COMPOSITE", "VEGETATION_TREND", "DROUGHT_ANALYSIS", "CROP_MAPPING", "CARBON_ESTIMATE"] as const;

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function seededFloat(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export interface GEECompositeRequest {
  regionId: string;
  regionName: string;
  state: string;
  startDate: string;
  endDate: string;
  satellite?: GEESatellite;
  compositeType?: "monthly" | "seasonal" | "annual";
}

export function computeGEEComposite(req: GEECompositeRequest): GEEVegetationComposite {
  const { regionId, regionName, startDate, endDate, state } = req;
  const satellite: GEESatellite = req.satellite ?? "Sentinel-2";
  const compositeType = req.compositeType ?? "monthly";
  const seed = seedHash(`${regionId}-${startDate}-${satellite}`);

  // State-calibrated NDVI baselines matching benchmarking.ts
  const STATE_NDVI: Record<string, number> = {
    "Punjab": 0.71, "Haryana": 0.68, "Uttar Pradesh": 0.60,
    "Madhya Pradesh": 0.57, "Maharashtra": 0.55, "Gujarat": 0.59,
    "Karnataka": 0.54, "Andhra Pradesh": 0.56, "Telangana": 0.55,
    "Bihar": 0.58, "West Bengal": 0.63, "Tamil Nadu": 0.57,
    "Rajasthan": 0.42, "Odisha": 0.59, "Chhattisgarh": 0.58,
  };
  const base = STATE_NDVI[state] ?? 0.55;

  const meanNDVI = parseFloat(seededFloat(seed, base * 0.90, base * 1.10).toFixed(4));
  const medianNDVI = parseFloat(seededFloat(seed + 1, meanNDVI - 0.02, meanNDVI + 0.02).toFixed(4));
  const stdNDVI = parseFloat(seededFloat(seed + 2, 0.04, 0.12).toFixed(4));
  const cloudFreePct = Math.round(seededFloat(seed + 3, 72, 98));
  const pixelCount = Math.round(seededFloat(seed + 4, 50000, 2000000));
  const areaCoveredKmSq = Math.round(pixelCount * 100 / 10000);

  return {
    regionId,
    regionName,
    compositeType,
    startDate,
    endDate,
    satellite,
    meanNDVI,
    medianNDVI,
    stdNDVI,
    pixelCount,
    cloudFreePct,
    areaCoveredKmSq,
  };
}

export function generateGEETask(
  regionId: string,
  regionName: string,
  type: GEETask["type"] = "NDVI_COMPOSITE",
  state = "Maharashtra",
): GEETask {
  const seed = seedHash(`${regionId}-${type}`);
  const taskId = `GEE-${regionId.slice(0, 6).toUpperCase()}-${(seed % 9999).toString().padStart(4, "0")}`;
  const progressPct = Math.min(100, Math.round(seededFloat(seed + 5, 40, 100)));
  const status: GEETask["status"] = progressPct >= 100 ? "COMPLETED" : progressPct > 50 ? "RUNNING" : "PENDING";
  const satellite: GEESatellite = (["Sentinel-2", "Landsat-8", "Landsat-9", "MODIS"] as GEESatellite[])[seed % 4];

  const resultSummary = status === "COMPLETED"
    ? computeGEEComposite({
        regionId, regionName, state,
        startDate: "2025-10-01",
        endDate: "2025-12-31",
        satellite,
        compositeType: "seasonal",
      })
    : undefined;

  return {
    taskId,
    type,
    status,
    region: regionName,
    satellite,
    startedAt: new Date(Date.now() - seed % 3600000).toISOString(),
    completedAt: status === "COMPLETED" ? new Date().toISOString() : undefined,
    progressPct,
    resultSummary,
  };
}

export function listGEETasks(regionIds: string[], state: string): GEETask[] {
  return regionIds.map((id, i) =>
    generateGEETask(id, `Region-${id.slice(0, 4)}`, TASK_TYPES[i % TASK_TYPES.length], state)
  );
}
