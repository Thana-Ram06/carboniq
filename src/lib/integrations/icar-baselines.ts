/**
 * ICAR / MoAFW Crop Baseline Integration — VASUDHA Phase 10
 *
 * State-level crop production statistics from:
 *  - ICAR Annual Report 2023-24
 *  - MoAFW Agricultural Statistics at a Glance 2023
 *  - State Directorate of Agriculture reports
 */

import type { CropType, ICARCropBaseline } from "@/types";

const BASELINES: ICARCropBaseline[] = [
  // Rice
  { cropType: "rice", state: "West Bengal",   season: "Kharif", yieldTonnesHa: 2.84, areaMha: 5.48, productionMt: 15.56, irrigatedPct: 52, year: 2023, source: "MoAFW" },
  { cropType: "rice", state: "Uttar Pradesh", season: "Kharif", yieldTonnesHa: 2.65, areaMha: 5.92, productionMt: 15.70, irrigatedPct: 68, year: 2023, source: "MoAFW" },
  { cropType: "rice", state: "Punjab",        season: "Kharif", yieldTonnesHa: 4.14, areaMha: 3.12, productionMt: 12.93, irrigatedPct: 99, year: 2023, source: "MoAFW" },
  { cropType: "rice", state: "Andhra Pradesh",season: "Kharif", yieldTonnesHa: 3.34, areaMha: 2.04, productionMt: 6.81,  irrigatedPct: 70, year: 2023, source: "MoAFW" },
  { cropType: "rice", state: "Tamil Nadu",    season: "Kharif", yieldTonnesHa: 3.08, areaMha: 1.82, productionMt: 5.61,  irrigatedPct: 88, year: 2023, source: "MoAFW" },
  { cropType: "rice", state: "Odisha",        season: "Kharif", yieldTonnesHa: 1.92, areaMha: 4.22, productionMt: 8.11,  irrigatedPct: 32, year: 2023, source: "MoAFW" },

  // Wheat
  { cropType: "wheat", state: "Uttar Pradesh", season: "Rabi", yieldTonnesHa: 3.36, areaMha: 10.19, productionMt: 34.23, irrigatedPct: 92, year: 2023, source: "MoAFW" },
  { cropType: "wheat", state: "Punjab",        season: "Rabi", yieldTonnesHa: 5.07, areaMha: 3.51,  productionMt: 17.80, irrigatedPct: 99, year: 2023, source: "MoAFW" },
  { cropType: "wheat", state: "Haryana",       season: "Rabi", yieldTonnesHa: 4.78, areaMha: 2.55,  productionMt: 12.20, irrigatedPct: 99, year: 2023, source: "MoAFW" },
  { cropType: "wheat", state: "Madhya Pradesh",season: "Rabi", yieldTonnesHa: 2.96, areaMha: 5.37,  productionMt: 15.90, irrigatedPct: 48, year: 2023, source: "MoAFW" },
  { cropType: "wheat", state: "Rajasthan",     season: "Rabi", yieldTonnesHa: 2.98, areaMha: 3.14,  productionMt: 9.37,  irrigatedPct: 56, year: 2023, source: "MoAFW" },

  // Sugarcane
  { cropType: "sugarcane", state: "Uttar Pradesh", season: "Annual", yieldTonnesHa: 72.5, areaMha: 2.26, productionMt: 163.7, irrigatedPct: 98, year: 2023, source: "MoAFW" },
  { cropType: "sugarcane", state: "Maharashtra",   season: "Annual", yieldTonnesHa: 74.8, areaMha: 1.12, productionMt: 83.8,  irrigatedPct: 95, year: 2023, source: "MoAFW" },
  { cropType: "sugarcane", state: "Karnataka",     season: "Annual", yieldTonnesHa: 82.0, areaMha: 0.52, productionMt: 42.7,  irrigatedPct: 97, year: 2023, source: "MoAFW" },
  { cropType: "sugarcane", state: "Tamil Nadu",    season: "Annual", yieldTonnesHa: 94.4, areaMha: 0.28, productionMt: 26.4,  irrigatedPct: 99, year: 2023, source: "MoAFW" },

  // Cotton
  { cropType: "cotton", state: "Gujarat",         season: "Kharif", yieldTonnesHa: 0.56, areaMha: 2.57, productionMt: 1.44, irrigatedPct: 72, year: 2023, source: "MoAFW" },
  { cropType: "cotton", state: "Maharashtra",     season: "Kharif", yieldTonnesHa: 0.30, areaMha: 4.08, productionMt: 1.23, irrigatedPct: 18, year: 2023, source: "MoAFW" },
  { cropType: "cotton", state: "Andhra Pradesh",  season: "Kharif", yieldTonnesHa: 0.58, areaMha: 1.62, productionMt: 0.94, irrigatedPct: 64, year: 2023, source: "MoAFW" },

  // Soybean
  { cropType: "soybean", state: "Madhya Pradesh", season: "Kharif", yieldTonnesHa: 1.18, areaMha: 5.71, productionMt: 6.74, irrigatedPct: 12, year: 2023, source: "ICAR" },
  { cropType: "soybean", state: "Maharashtra",    season: "Kharif", yieldTonnesHa: 1.02, areaMha: 3.88, productionMt: 3.96, irrigatedPct: 8,  year: 2023, source: "ICAR" },

  // Maize
  { cropType: "maize", state: "Karnataka",     season: "Kharif", yieldTonnesHa: 3.84, areaMha: 1.22, productionMt: 4.69, irrigatedPct: 58, year: 2023, source: "ICAR" },
  { cropType: "maize", state: "Andhra Pradesh",season: "Kharif", yieldTonnesHa: 5.12, areaMha: 0.88, productionMt: 4.51, irrigatedPct: 76, year: 2023, source: "ICAR" },

  // Mustard
  { cropType: "mustard", state: "Rajasthan",     season: "Rabi", yieldTonnesHa: 1.42, areaMha: 2.86, productionMt: 4.06, irrigatedPct: 28, year: 2023, source: "MoAFW" },
  { cropType: "mustard", state: "Uttar Pradesh", season: "Rabi", yieldTonnesHa: 1.34, areaMha: 0.92, productionMt: 1.23, irrigatedPct: 48, year: 2023, source: "MoAFW" },
  { cropType: "mustard", state: "Haryana",       season: "Rabi", yieldTonnesHa: 1.58, areaMha: 0.65, productionMt: 1.03, irrigatedPct: 58, year: 2023, source: "MoAFW" },
];

export function getBaselinesForCrop(cropType: CropType): ICARCropBaseline[] {
  return BASELINES.filter((b) => b.cropType === cropType);
}

export function getBaselinesForState(state: string): ICARCropBaseline[] {
  return BASELINES.filter((b) => b.state === state);
}

export function getBaseline(cropType: CropType, state: string): ICARCropBaseline | undefined {
  return BASELINES.find((b) => b.cropType === cropType && b.state === state);
}

export function getNationalAverage(cropType: CropType): number {
  const entries = getBaselinesForCrop(cropType);
  if (entries.length === 0) return 2.0;
  const totalArea = entries.reduce((s, b) => s + b.areaMha, 0);
  const weightedYield = entries.reduce((s, b) => s + b.yieldTonnesHa * b.areaMha, 0);
  return parseFloat((weightedYield / totalArea).toFixed(2));
}

export function getAllCropSummary(): Array<{ cropType: CropType; avgYield: number; totalAreaMha: number; states: number }> {
  const crops = [...new Set(BASELINES.map((b) => b.cropType))] as CropType[];
  return crops.map((cropType) => {
    const entries = getBaselinesForCrop(cropType);
    const totalArea = entries.reduce((s, b) => s + b.areaMha, 0);
    const avgYield = entries.length > 0
      ? entries.reduce((s, b) => s + b.yieldTonnesHa * b.areaMha, 0) / totalArea
      : 0;
    return { cropType, avgYield: parseFloat(avgYield.toFixed(2)), totalAreaMha: parseFloat(totalArea.toFixed(2)), states: entries.length };
  });
}
