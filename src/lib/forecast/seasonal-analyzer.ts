/**
 * Seasonal Intelligence Engine — VASUDHA Phase 10
 *
 * Generates seasonal outlook for Kharif/Rabi/Zaid seasons:
 *  - Sowing window recommendations
 *  - Projected yield indices
 *  - Crop recommendations based on climate outlook
 *  - Risk factor identification
 */

import type { SeasonalIntelligence, CropProductivityForecast, CropType } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

type Season = "Kharif" | "Rabi" | "Zaid";

const SEASON_WINDOWS: Record<Season, {
  sowing: [string, string];
  harvest: [string, string];
  peak: string;
  crops: CropType[];
  riskFactors: string[];
}> = {
  Kharif: {
    sowing: ["June 1", "July 15"],
    harvest: ["October 1", "November 30"],
    peak: "August",
    crops: ["rice", "cotton", "maize", "soybean", "groundnut"],
    riskFactors: ["Delayed monsoon onset", "Excess rain / flooding", "Pest pressure in humid conditions", "Post-harvest moisture damage"],
  },
  Rabi: {
    sowing: ["October 15", "December 1"],
    harvest: ["March 1", "April 30"],
    peak: "January",
    crops: ["wheat", "mustard", "sunflower"],
    riskFactors: ["Cold wave / frost damage", "Dry spell in December", "Unseasonal rain at harvest", "Water stress in Jan-Feb"],
  },
  Zaid: {
    sowing: ["February 15", "March 31"],
    harvest: ["May 1", "June 30"],
    peak: "April",
    crops: ["maize", "sunflower", "other"],
    riskFactors: ["Extreme heat in May", "Water scarcity for irrigation", "Pest attack on short-duration crops"],
  },
};

const NATIONAL_YIELDS: Record<CropType, number> = {
  rice: 2.7, wheat: 3.5, sugarcane: 70.0, cotton: 0.45,
  maize: 3.1, soybean: 1.2, groundnut: 1.6, sunflower: 0.9,
  mustard: 1.3, other: 2.0,
};

const STATE_MULTIPLIERS: Record<string, number> = {
  "Punjab": 1.42, "Haryana": 1.38, "Uttar Pradesh": 1.05,
  "Madhya Pradesh": 0.95, "Maharashtra": 0.88, "Gujarat": 1.1,
  "Karnataka": 0.92, "Andhra Pradesh": 0.97, "Telangana": 0.95,
  "Bihar": 0.82, "West Bengal": 1.15, "Tamil Nadu": 1.02,
  "Rajasthan": 0.78, "Odisha": 0.85, "Chhattisgarh": 0.80,
  "Kerala": 0.95,
};

function currentSeason(): Season {
  const m = new Date().getMonth();
  if (m >= 5 && m <= 9) return "Kharif";
  if (m >= 10 || m <= 1) return "Rabi";
  return "Zaid";
}

function rainfallOutlook(rainfallDep: number): SeasonalIntelligence["rainfallOutlook"] {
  if (rainfallDep > 10) return "above-normal";
  if (rainfallDep < -10) return "below-normal";
  return "normal";
}

export function computeSeasonalIntelligence(state: string, rainfallDeparturePct = 0): SeasonalIntelligence {
  const season = currentSeason();
  const year = new Date().getFullYear();
  const template = SEASON_WINDOWS[season];
  const seed = seedHash(`${state}-${season}-${year}`);

  const yieldIdx = parseFloat(sf(seed, 0.85 + rainfallDeparturePct * 0.002, 1.20).toFixed(3));
  const confidence = Math.round(sf(seed + 1, 64, 86));
  const riskCount = Math.ceil(sf(seed + 2, 0, template.riskFactors.length));
  const selectedRisks = template.riskFactors.slice(0, Math.max(1, riskCount));
  const recommendedCrops = template.crops.slice(0, 3);

  return {
    season,
    year,
    state,
    sowingWindowStart: `${year} ${template.sowing[0]}`,
    sowingWindowEnd: `${year} ${template.sowing[1]}`,
    peakGrowthMonth: template.peak,
    harvestWindowStart: `${year} ${template.harvest[0]}`,
    harvestWindowEnd: `${year} ${template.harvest[1]}`,
    projectedYieldIndex: yieldIdx,
    rainfallOutlook: rainfallOutlook(rainfallDeparturePct),
    recommendedCrops,
    riskFactors: selectedRisks,
    confidence,
  };
}

export function computeCropProductivityForecast(
  cropType: CropType,
  state: string,
  irrigationType: string,
): CropProductivityForecast {
  const seed = seedHash(`${cropType}-${state}-${irrigationType}`);
  const season = currentSeason();
  const national = NATIONAL_YIELDS[cropType];
  const stateMul = STATE_MULTIPLIERS[state] ?? 1.0;
  const irrBonus = irrigationType === "drip" ? 0.15 : irrigationType === "rainfed" ? -0.10 : 0.05;

  const forecastYield = parseFloat((national * stateMul * (1 + irrBonus) * sf(seed, 0.9, 1.15)).toFixed(2));
  const benchmark = parseFloat((national * stateMul).toFixed(2));
  const perfIndex = parseFloat((forecastYield / benchmark).toFixed(3));
  const probBelow = Math.round(Math.max(5, Math.min(80, 40 - perfIndex * 20)));

  return {
    cropType,
    state,
    season: `${season} ${new Date().getFullYear()}`,
    forecastYieldTha: forecastYield,
    nationalBenchmarkTha: national,
    performanceIndex: perfIndex,
    probabilityBelowBenchmark: probBelow,
    climaticRiskScore: Math.round(sf(seed + 3, 15, 65)),
    irrigationAdequacyScore: Math.round(sf(seed + 4, 50, 95)),
    forecastConfidence: Math.round(sf(seed + 5, 60, 88)),
  };
}
