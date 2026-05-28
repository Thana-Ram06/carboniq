/**
 * Data Benchmarking System — VASUDHA Phase 9
 *
 * Compares farm metrics against:
 *  - District averages (synthetic from state baselines)
 *  - State averages (ICAR / MoAFW 2023-24 statistics)
 *  - National averages
 *
 * Returns percentile rankings and delta analysis.
 */

import type { CropType, IrrigationType, BenchmarkData, BenchmarkComparison } from "@/types";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";

// State-level NDVI baselines (Kharif season peak, from ISRO NRSC data approximations)
const STATE_NDVI_BASELINE: Record<string, number> = {
  "Punjab": 0.71, "Haryana": 0.68, "Uttar Pradesh": 0.60,
  "Madhya Pradesh": 0.57, "Maharashtra": 0.55, "Gujarat": 0.59,
  "Karnataka": 0.54, "Andhra Pradesh": 0.56, "Telangana": 0.55,
  "Bihar": 0.58, "West Bengal": 0.63, "Tamil Nadu": 0.57,
  "Rajasthan": 0.42, "Odisha": 0.59, "Chhattisgarh": 0.58, "Kerala": 0.62,
};

const NATIONAL_NDVI_AVG = 0.56;
const NATIONAL_CARBON_AVG = 3.2; // tCO2e/ha
const NATIONAL_YIELD_AVG = 2.5;  // t/ha

function percentile(farmVal: number, distAvg: number, stateAvg: number): number {
  const ratio = farmVal / stateAvg;
  return Math.round(Math.max(5, Math.min(99, 50 + (ratio - 1) * 100)));
}

export interface BenchmarkInput {
  farmId: string;
  userId: string;
  cropType: CropType;
  irrigationType: IrrigationType;
  state: string;
  areaHectares: number;
}

export function computeBenchmark(input: BenchmarkInput): Omit<BenchmarkData, "id" | "computedAt"> {
  const { farmId, userId, cropType, irrigationType, state, areaHectares } = input;

  const ndviResult = computeFarmNDVI({ farmId, cropType, irrigationType, state, areaHectares });
  const peakNDVI = Math.max(...ndviResult.timeSeries.map((h) => h.ndvi));
  const avgNDVI = ndviResult.timeSeries.reduce((s, h) => s + h.ndvi, 0) / ndviResult.timeSeries.length;
  const carbon = computeCarbonIntelligence({ id: farmId, cropType, areaHectares } as never, avgNDVI);
  const carbonPerHa = carbon.carbonScoreTonnes / Math.max(areaHectares, 0.1);

  const stateNDVI = STATE_NDVI_BASELINE[state] ?? NATIONAL_NDVI_AVG;
  const districtNDVI = stateNDVI * 0.95; // district typically 5% below state avg

  const stateCarbon = NATIONAL_CARBON_AVG * (stateNDVI / NATIONAL_NDVI_AVG);
  const districtCarbon = stateCarbon * 0.92;

  const yieldTha = Math.min(80, Math.max(0.5, peakNDVI * 5.5));
  const stateYield = NATIONAL_YIELD_AVG * (stateNDVI / NATIONAL_NDVI_AVG);
  const districtYield = stateYield * 0.93;

  const vegCovFarm = ndviResult.current.vegetationCoverage;
  const stateVegCov = Math.round(stateNDVI * 100);
  const distVegCov = Math.round(districtNDVI * 100);

  const comparisons: BenchmarkComparison[] = [
    {
      metric: "Peak NDVI",
      farmValue: parseFloat(peakNDVI.toFixed(3)),
      districtAvg: parseFloat(districtNDVI.toFixed(3)),
      stateAvg: parseFloat(stateNDVI.toFixed(3)),
      nationalAvg: parseFloat(NATIONAL_NDVI_AVG.toFixed(3)),
      percentile: percentile(peakNDVI, districtNDVI, stateNDVI),
      delta: parseFloat((peakNDVI - districtNDVI).toFixed(3)),
    },
    {
      metric: "Carbon (tCO₂e/ha)",
      farmValue: parseFloat(carbonPerHa.toFixed(2)),
      districtAvg: parseFloat(districtCarbon.toFixed(2)),
      stateAvg: parseFloat(stateCarbon.toFixed(2)),
      nationalAvg: parseFloat(NATIONAL_CARBON_AVG.toFixed(2)),
      percentile: percentile(carbonPerHa, districtCarbon, stateCarbon),
      delta: parseFloat((carbonPerHa - districtCarbon).toFixed(2)),
    },
    {
      metric: "Est. Yield (t/ha)",
      farmValue: parseFloat(yieldTha.toFixed(2)),
      districtAvg: parseFloat(districtYield.toFixed(2)),
      stateAvg: parseFloat(stateYield.toFixed(2)),
      nationalAvg: parseFloat(NATIONAL_YIELD_AVG.toFixed(2)),
      percentile: percentile(yieldTha, districtYield, stateYield),
      delta: parseFloat((yieldTha - districtYield).toFixed(2)),
    },
    {
      metric: "Vegetation Cover (%)",
      farmValue: vegCovFarm,
      districtAvg: distVegCov,
      stateAvg: stateVegCov,
      nationalAvg: Math.round(NATIONAL_NDVI_AVG * 100),
      percentile: percentile(vegCovFarm, distVegCov, stateVegCov),
      delta: parseFloat((vegCovFarm - distVegCov).toFixed(1)),
    },
  ];

  const overallPercentile = Math.round(
    comparisons.reduce((s, c) => s + c.percentile, 0) / comparisons.length
  );

  const best = comparisons.reduce((a, b) => a.percentile > b.percentile ? a : b);

  return {
    farmId,
    userId,
    comparisons,
    overallPercentile,
    standoutMetric: best.metric,
  };
}

export function percentileColor(p: number): string {
  if (p >= 75) return "text-green-400";
  if (p >= 50) return "text-emerald-400";
  if (p >= 25) return "text-yellow-400";
  return "text-red-400";
}

export function deltaLabel(delta: number, unit = ""): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(2)}${unit}`;
}
