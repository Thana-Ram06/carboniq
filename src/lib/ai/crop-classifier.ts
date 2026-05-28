/**
 * Crop Classification Engine — VASUDHA Phase 9
 *
 * Classifies likely crop type from NDVI time-series signature using:
 *  - Pearson correlation between observed NDVI and crop phenology templates
 *  - Seasonal alignment detection (Kharif / Rabi / Zaid / Perennial)
 *  - Irrigation type and state climate modifiers
 *  - Deterministic results tied to farmId
 */

import type { CropType, CropPrediction } from "@/types";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";

// Monthly NDVI phenology signatures (same as ndvi-engine CROP_PHENOLOGY)
const CROP_SIGNATURES: Record<CropType, number[]> = {
  rice:      [0.10, 0.10, 0.10, 0.10, 0.12, 0.24, 0.52, 0.74, 0.80, 0.64, 0.34, 0.12],
  wheat:     [0.44, 0.70, 0.80, 0.56, 0.18, 0.10, 0.10, 0.10, 0.10, 0.14, 0.22, 0.36],
  sugarcane: [0.56, 0.60, 0.66, 0.72, 0.76, 0.72, 0.68, 0.72, 0.76, 0.73, 0.66, 0.60],
  cotton:    [0.10, 0.10, 0.12, 0.15, 0.24, 0.44, 0.64, 0.74, 0.76, 0.68, 0.46, 0.20],
  maize:     [0.10, 0.10, 0.12, 0.18, 0.26, 0.50, 0.74, 0.82, 0.66, 0.36, 0.15, 0.10],
  soybean:   [0.10, 0.10, 0.10, 0.12, 0.16, 0.38, 0.68, 0.80, 0.74, 0.48, 0.20, 0.10],
  groundnut: [0.10, 0.10, 0.12, 0.16, 0.26, 0.52, 0.70, 0.74, 0.70, 0.50, 0.24, 0.12],
  sunflower: [0.10, 0.14, 0.20, 0.42, 0.64, 0.76, 0.68, 0.46, 0.22, 0.12, 0.10, 0.10],
  mustard:   [0.34, 0.60, 0.66, 0.40, 0.14, 0.10, 0.10, 0.10, 0.10, 0.24, 0.44, 0.54],
  other:     [0.30, 0.34, 0.40, 0.44, 0.48, 0.50, 0.54, 0.58, 0.54, 0.50, 0.42, 0.36],
};

const SEASON_MAP: Record<CropType, "kharif" | "rabi" | "zaid" | "perennial"> = {
  rice: "kharif", cotton: "kharif", maize: "kharif", soybean: "kharif", groundnut: "kharif",
  wheat: "rabi", mustard: "rabi",
  sunflower: "zaid",
  sugarcane: "perennial", other: "perennial",
};

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  const num = a.reduce((s, v, i) => s + (v - ma) * (b[i] - mb), 0);
  const da = Math.sqrt(a.reduce((s, v) => s + (v - ma) ** 2, 0));
  const db = Math.sqrt(b.reduce((s, v) => s + (v - mb) ** 2, 0));
  if (da === 0 || db === 0) return 0;
  return num / (da * db);
}

export interface ClassifyInput {
  farmId: string;
  userId: string;
  cropType: CropType;
  irrigationType: import("@/types").IrrigationType;
  state: string;
  areaHectares: number;
}

export function classifyCrop(input: ClassifyInput): Omit<CropPrediction, "id" | "computedAt"> {
  const { farmId, userId, cropType, irrigationType, state, areaHectares } = input;

  const ndviResult = computeFarmNDVI({ farmId, cropType, irrigationType, state, areaHectares });
  const observed = ndviResult.timeSeries.map((h) => h.ndvi);

  // Compute correlation with each crop signature
  const scores: Array<{ crop: CropType; correlation: number }> = (
    Object.entries(CROP_SIGNATURES) as [CropType, number[]][]
  ).map(([crop, sig]) => ({
    crop,
    correlation: pearsonCorrelation(observed, sig),
  })).sort((a, b) => b.correlation - a.correlation);

  const best = scores[0];
  const second = scores[1];

  // Confidence: gap between top-1 and top-2 correlation amplifies certainty
  const gap = best.correlation - second.correlation;
  const signatureMatch = parseFloat(Math.max(0, Math.min(1, best.correlation)).toFixed(4));
  const confidence = Math.round(Math.max(40, Math.min(97, 50 + best.correlation * 35 + gap * 40)));

  const alternativeCrops = scores.slice(1, 4).map((s) => ({
    crop: s.crop,
    confidence: Math.round(Math.max(5, Math.min(60, 50 + s.correlation * 30))),
  }));

  return {
    farmId,
    userId,
    predictedCrop: best.crop,
    confidence,
    alternativeCrops,
    signatureMatch,
    seasonalAlignment: SEASON_MAP[best.crop],
  };
}
