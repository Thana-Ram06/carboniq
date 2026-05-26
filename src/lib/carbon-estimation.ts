import type {
  CarbonEstimationInputs,
  CarbonEstimationResults,
  CropType,
  IrrigationType,
} from "@/types";

// ──────────────────────────────────────────
// EMISSION FACTORS & COEFFICIENTS
// Based on IPCC Tier 1 guidelines adapted for Indian agriculture
// ──────────────────────────────────────────

const CROP_CARBON_FACTOR: Record<CropType, number> = {
  rice: 1.8,
  wheat: 2.1,
  sugarcane: 3.2,
  cotton: 1.5,
  maize: 2.4,
  soybean: 2.8,
  groundnut: 2.0,
  sunflower: 1.9,
  mustard: 2.2,
  other: 1.6,
};

const IRRIGATION_EFFICIENCY: Record<IrrigationType, number> = {
  drip: 0.92,
  sprinkler: 0.85,
  flood: 0.55,
  rainfed: 0.70,
  canal: 0.65,
  borewell: 0.78,
};

const NDVI_BIOMASS_MULTIPLIER = 8.4;
const BIOMASS_TO_CARBON = 0.47;
const CARBON_TO_CO2E = 3.67;
const SOIL_CARBON_BASE = 0.8;

// ──────────────────────────────────────────
// MAIN ESTIMATION ENGINE
// ──────────────────────────────────────────

export function estimateCarbon(
  inputs: CarbonEstimationInputs
): CarbonEstimationResults {
  const {
    cropType,
    areaHectares,
    irrigationType,
    ndviScore,
    vegetationCoverage,
    soilOrganicCarbon = 1.2,
    fertilizerUseKgPerHa = 80,
    seasonalCycles = 1,
  } = inputs;

  const cropFactor = CROP_CARBON_FACTOR[cropType];
  const irrigationEfficiency = IRRIGATION_EFFICIENCY[irrigationType];
  const ndviNormalized = Math.max(0, Math.min(1, ndviScore));

  // Biomass carbon calculation
  const estimatedBiomass =
    ndviNormalized * NDVI_BIOMASS_MULTIPLIER * areaHectares * cropFactor;
  const biomassCarbon = estimatedBiomass * BIOMASS_TO_CARBON;

  // Soil carbon sequestration
  const soilCarbon =
    soilOrganicCarbon *
    SOIL_CARBON_BASE *
    areaHectares *
    irrigationEfficiency *
    seasonalCycles;

  // Reduced emissions from efficient irrigation
  const reducedEmissions =
    irrigationEfficiency * areaHectares * 0.3 * vegetationCoverage * 10;

  // Water conservation benefit
  const waterConservation = irrigationEfficiency * areaHectares * 0.15;

  // Total CO2e reduction
  const totalCO2eReduction =
    (biomassCarbon + soilCarbon + reducedEmissions) * CARBON_TO_CO2E -
    (fertilizerUseKgPerHa * areaHectares * 0.0057 * seasonalCycles);

  const actualCO2e = Math.max(0.1, totalCO2eReduction);

  // Carbon score (0–100)
  const carbonScore = Math.min(
    100,
    Math.round(
      ndviNormalized * 35 +
        irrigationEfficiency * 30 +
        (vegetationCoverage / 100) * 20 +
        Math.min(soilOrganicCarbon / 3, 1) * 15
    )
  );

  // Sustainability index (0–1)
  const sustainabilityIndex = Math.min(
    1,
    (irrigationEfficiency * 0.3 +
      ndviNormalized * 0.3 +
      (vegetationCoverage / 100) * 0.2 +
      Math.min(soilOrganicCarbon / 3, 1) * 0.2)
  );

  // Projected annual carbon credits (at ~$15/tCO2e average India)
  const projectedAnnualCredits = actualCO2e * 15 * seasonalCycles;

  // Emission reduction factor
  const emissionReductionFactor =
    reducedEmissions / Math.max(1, actualCO2e / CARBON_TO_CO2E);

  // Confidence based on data completeness
  let confidence: "low" | "medium" | "high" = "low";
  if (soilOrganicCarbon > 1 && ndviScore > 0 && fertilizerUseKgPerHa > 0) {
    confidence = ndviScore > 0.3 ? "high" : "medium";
  } else if (ndviScore > 0) {
    confidence = "medium";
  }

  return {
    totalCO2eReduction: parseFloat(actualCO2e.toFixed(2)),
    carbonScore,
    sustainabilityIndex: parseFloat(sustainabilityIndex.toFixed(3)),
    estimatedBiomass: parseFloat(estimatedBiomass.toFixed(2)),
    soilCarbonSequestration: parseFloat(soilCarbon.toFixed(2)),
    emissionReductionFactor: parseFloat(emissionReductionFactor.toFixed(3)),
    projectedAnnualCredits: parseFloat(projectedAnnualCredits.toFixed(2)),
    confidence,
    breakdown: {
      biomassCarbon: parseFloat((biomassCarbon * CARBON_TO_CO2E).toFixed(2)),
      soilCarbon: parseFloat((soilCarbon * CARBON_TO_CO2E).toFixed(2)),
      reducedEmissions: parseFloat(reducedEmissions.toFixed(2)),
      waterConservation: parseFloat(waterConservation.toFixed(2)),
    },
  };
}

// ──────────────────────────────────────────
// QUICK ESTIMATE (for dashboard cards)
// ──────────────────────────────────────────

export function quickCarbonEstimate(
  areaHectares: number,
  cropType: CropType,
  ndvi = 0.5
): number {
  const factor = CROP_CARBON_FACTOR[cropType] ?? 1.6;
  return parseFloat((areaHectares * factor * ndvi * 2.5).toFixed(2));
}

export function getCarbonScoreTrend(
  scores: number[]
): "up" | "down" | "stable" {
  if (scores.length < 2) return "stable";
  const last = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const diff = last - prev;
  if (Math.abs(diff) < 2) return "stable";
  return diff > 0 ? "up" : "down";
}

// ──────────────────────────────────────────
// MOCK DATA GENERATOR (dev / demo mode)
// ──────────────────────────────────────────

export function generateMockCarbonTimeSeries(months = 12) {
  const base = 45 + Math.random() * 20;
  return Array.from({ length: months }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (months - 1 - i));
    const seasonalBoost = Math.sin((i / months) * Math.PI * 2) * 15;
    const noise = (Math.random() - 0.5) * 8;
    return {
      month: month.toLocaleString("en-IN", { month: "short" }),
      year: month.getFullYear(),
      carbonScore: Math.max(
        20,
        Math.min(100, Math.round(base + seasonalBoost + noise + i * 0.5))
      ),
      co2eReduction: parseFloat(
        (base * 0.8 + seasonalBoost * 0.5 + Math.random() * 5).toFixed(2)
      ),
    };
  });
}

export function generateMockNDVITimeSeries(months = 12) {
  const base = 0.45 + Math.random() * 0.2;
  return Array.from({ length: months }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (months - 1 - i));
    const seasonal = Math.sin((i / months) * Math.PI * 2) * 0.2;
    const noise = (Math.random() - 0.5) * 0.1;
    return {
      month: month.toLocaleString("en-IN", { month: "short" }),
      ndvi: parseFloat(
        Math.max(0.1, Math.min(0.95, base + seasonal + noise)).toFixed(3)
      ),
      biomass: parseFloat(
        (Math.max(0.1, base + seasonal + noise) * 8.4).toFixed(2)
      ),
    };
  });
}
