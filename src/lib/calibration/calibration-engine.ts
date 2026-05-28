import type { CalibrationCoefficient, SeasonalCorrectionFactor } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const COEFFICIENTS_TEMPLATE = [
  { param: "ndvi_biomass_alpha", desc: "Linear coefficient for NDVI → AGB conversion", def: 1.0, min: 0.7, max: 1.3 },
  { param: "ndvi_biomass_beta", desc: "Intercept for NDVI → AGB regression", def: 0.0, min: -0.2, max: 0.2 },
  { param: "agb_carbon_fraction", desc: "Carbon fraction of above-ground biomass (IPCC default: 0.47)", def: 0.47, min: 0.40, max: 0.55 },
  { param: "root_shoot_ratio", desc: "Below-ground to above-ground biomass ratio", def: 0.26, min: 0.15, max: 0.45 },
  { param: "litter_fraction", desc: "Dead organic matter carbon fraction", def: 0.035, min: 0.01, max: 0.08 },
  { param: "soil_carbon_depth_m", desc: "Soil organic carbon sampling depth in metres", def: 0.30, min: 0.15, max: 0.50 },
  { param: "sentinel_cloud_threshold", desc: "Maximum cloud cover % for NDVI computation", def: 0.20, min: 0.05, max: 0.40 },
  { param: "ndvi_smoothing_window", desc: "Temporal smoothing window in days for NDVI series", def: 16.0, min: 8.0, max: 32.0 },
];

export function getCalibrationCoefficients(): CalibrationCoefficient[] {
  const calibrators = ["Dr. Anita Sharma", "Ravi Patil", "IPCC WG3", "Internal Team", "ESA Sentinel Team"];
  return COEFFICIENTS_TEMPLATE.map((t, i) => {
    const seed = seedHash(t.param);
    const perturbation = sf(seed, -0.05, 0.05);
    const curr = parseFloat((t.def * (1 + perturbation)).toFixed(5));
    return {
      id: `coeff-${String(i + 1).padStart(3, "0")}`,
      paramName: t.param,
      description: t.desc,
      currentValue: curr,
      defaultValue: t.def,
      minBound: t.min,
      maxBound: t.max,
      lastCalibrated: new Date(Date.now() - i * 14 * 86400000).toISOString(),
      calibratedBy: calibrators[i % calibrators.length],
      notes: i % 3 === 0 ? "Calibrated against 2025 Kharif ground-truth dataset" : "",
    };
  });
}

export function getSeasonalCorrectionFactors(): SeasonalCorrectionFactor[] {
  const seasons: SeasonalCorrectionFactor["season"][] = ["kharif", "rabi", "zaid"];
  const crops = ["Wheat", "Rice", "Cotton", "Soybean", "Sugarcane", "Maize"];
  return seasons.flatMap((season) =>
    crops.map((crop) => {
      const seed = seedHash(`${season}-${crop}`);
      return {
        season,
        cropType: crop,
        ndviMultiplier: parseFloat(sf(seed, 0.92, 1.08).toFixed(4)),
        carbonMultiplier: parseFloat(sf(seed + 1, 0.90, 1.10).toFixed(4)),
        validatedYears: [2023, 2024, 2025],
      };
    })
  );
}

export function getCalibrationSummary() {
  const coeffs = getCalibrationCoefficients();
  const deviatedCount = coeffs.filter((c) => Math.abs(c.currentValue - c.defaultValue) / c.defaultValue > 0.02).length;
  return {
    totalCoefficients: coeffs.length,
    deviatedFromDefault: deviatedCount,
    lastFullCalibration: "2026-03-15",
    nextScheduledCalibration: "2026-06-15",
    calibrationStatus: deviatedCount < 3 ? ("optimal" as const) : ("needs_review" as const),
    avgDeviation: parseFloat(
      (coeffs.reduce((a, c) => a + Math.abs(c.currentValue - c.defaultValue) / c.defaultValue, 0) / coeffs.length * 100).toFixed(2)
    ),
  };
}
