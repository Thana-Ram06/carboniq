/**
 * NDVI Computation Engine — VASUDHA Phase 2
 *
 * Produces scientifically-grounded NDVI analytics for Indian farmland using:
 *  • Crop phenology calendars (Kharif / Rabi / Zaid seasons)
 *  • Irrigation efficiency multipliers
 *  • State-level climate zone modifiers
 *  • Deterministic per-farm seeding (consistent results across sessions)
 *
 * Falls back to this engine when Sentinel Hub credentials are absent.
 * When credentials are present (src/lib/satellite/sentinel-hub.ts), real
 * per-pixel NDVI replaces these computed values automatically.
 */

import type { CropType, IrrigationType } from "@/types";

// ── Deterministic seed from farm ID ──────────────────────────────────────────

function farmSeed(farmId: string, salt = 0): number {
  let h = salt;
  for (let i = 0; i < farmId.length; i++) {
    h = ((h << 5) - h + farmId.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 1000) / 1000; // 0…1, deterministic
}

function jitter(farmId: string, month: number, mag = 0.025): number {
  const s = farmSeed(farmId, month * 137);
  return (s - 0.5) * 2 * mag;
}

// ── Indian crop phenology (monthly NDVI base, Jan=0 … Dec=11) ────────────────
// Values sourced from ISRO Bhuvan / NRSC seasonal crop calendars.

const CROP_PHENOLOGY: Record<CropType, number[]> = {
  // Kharif — Jun transplant → Sep/Oct peak → Nov harvest
  rice:      [0.10, 0.10, 0.10, 0.10, 0.12, 0.24, 0.52, 0.74, 0.80, 0.64, 0.34, 0.12],
  // Rabi — Oct sow → Feb/Mar peak → Apr harvest
  wheat:     [0.44, 0.70, 0.80, 0.56, 0.18, 0.10, 0.10, 0.10, 0.10, 0.14, 0.22, 0.36],
  // Year-round; planted Jan-Mar, ~14 month cycle
  sugarcane: [0.56, 0.60, 0.66, 0.72, 0.76, 0.72, 0.68, 0.72, 0.76, 0.73, 0.66, 0.60],
  // Kharif — May plant → Aug/Sep peak → Dec harvest
  cotton:    [0.10, 0.10, 0.12, 0.15, 0.24, 0.44, 0.64, 0.74, 0.76, 0.68, 0.46, 0.20],
  // Kharif — Jun plant → Aug peak → Sep harvest
  maize:     [0.10, 0.10, 0.12, 0.18, 0.26, 0.50, 0.74, 0.82, 0.66, 0.36, 0.15, 0.10],
  // Kharif — Jun plant → Aug/Sep peak → Oct harvest
  soybean:   [0.10, 0.10, 0.10, 0.12, 0.16, 0.38, 0.68, 0.80, 0.74, 0.48, 0.20, 0.10],
  // Kharif — Jun plant → Aug/Sep peak → Oct harvest
  groundnut: [0.10, 0.10, 0.12, 0.16, 0.26, 0.52, 0.70, 0.74, 0.70, 0.50, 0.24, 0.12],
  // Kharif — Feb/Mar plant → May/Jun peak → Jul harvest
  sunflower: [0.10, 0.14, 0.20, 0.42, 0.64, 0.76, 0.68, 0.46, 0.22, 0.12, 0.10, 0.10],
  // Rabi — Oct/Nov sow → Jan/Feb peak → Mar harvest
  mustard:   [0.34, 0.60, 0.66, 0.40, 0.14, 0.10, 0.10, 0.10, 0.10, 0.24, 0.44, 0.54],
  // Balanced multi-season placeholder
  other:     [0.30, 0.34, 0.40, 0.44, 0.48, 0.50, 0.54, 0.58, 0.54, 0.50, 0.42, 0.36],
};

// ── Irrigation efficiency multipliers ─────────────────────────────────────────

const IRRIGATION_MUL: Record<IrrigationType, number> = {
  drip:      1.08,
  sprinkler: 1.04,
  canal:     1.00,
  flood:     0.97,
  borewell:  0.95,
  rainfed:   0.88,
};

// ── State-level climate zone multipliers ──────────────────────────────────────
// Higher → wetter / cooler / more favourable for vegetation.

const STATE_MUL: Record<string, number> = {
  "Punjab":             1.06,
  "Haryana":            1.04,
  "Uttar Pradesh":      1.02,
  "Bihar":              0.98,
  "West Bengal":        1.07,
  "Assam":              1.08,
  "Odisha":             1.01,
  "Kerala":             1.09,
  "Tamil Nadu":         0.97,
  "Karnataka":          0.95,
  "Andhra Pradesh":     0.96,
  "Telangana":          0.93,
  "Maharashtra":        0.94,
  "Madhya Pradesh":     0.97,
  "Chhattisgarh":       0.99,
  "Gujarat":            0.89,
  "Rajasthan":          0.84,
  "Himachal Pradesh":   1.02,
  "Uttarakhand":        1.03,
  "Jharkhand":          0.97,
  "Goa":                1.06,
};

const DEFAULT_STATE_MUL = 0.96;

// ── NDVI color ramp ───────────────────────────────────────────────────────────

export function ndviToColor(ndvi: number, opacity = 0.55): string {
  if (ndvi >= 0.70) return `rgba(22,163,74,${opacity})`;
  if (ndvi >= 0.55) return `rgba(74,222,128,${opacity})`;
  if (ndvi >= 0.35) return `rgba(134,239,172,${opacity})`;
  if (ndvi >= 0.15) return `rgba(251,191,36,${opacity})`;
  return `rgba(239,68,68,${opacity})`;
}

export function ndviBorder(ndvi: number): string {
  if (ndvi >= 0.70) return "#16a34a";
  if (ndvi >= 0.55) return "#4ade80";
  if (ndvi >= 0.35) return "#86efac";
  if (ndvi >= 0.15) return "#fbbf24";
  return "#ef4444";
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface NDVIBands {
  ndvi: number;
  ndwi: number;
  evi: number;
  savi: number;
  vegetationCoverage: number;
  moistureIndex: number;
  cloudCoverage: number;
}

export interface NDVIMonthPoint {
  month: string;    // "Jan", "Feb", …
  ndvi: number;
  ndwi: number;
  evi: number;
}

export interface ComputedNDVI {
  current: NDVIBands;
  timeSeries: NDVIMonthPoint[];
  healthStatus: "sparse" | "moderate" | "healthy" | "very_healthy" | "dense";
  trend: "increasing" | "decreasing" | "stable";
  source: "computed";
  computedAt: string; // ISO date
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function computeFarmNDVI(params: {
  farmId: string;
  cropType: CropType;
  irrigationType: IrrigationType;
  state: string;
  areaHectares?: number;
}): ComputedNDVI {
  const { farmId, cropType, irrigationType, state } = params;
  const phenology = CROP_PHENOLOGY[cropType] ?? CROP_PHENOLOGY.other;
  const irrMul = IRRIGATION_MUL[irrigationType] ?? 1.0;
  const stateMul = STATE_MUL[state] ?? DEFAULT_STATE_MUL;
  const combinedMul = irrMul * stateMul;

  // Current month (0-based)
  const now = new Date();
  const curMonth = now.getMonth();

  // Build 12-month NDVI series
  const timeSeries: NDVIMonthPoint[] = MONTHS.map((month, mi) => {
    const base = phenology[mi];
    const rawNdvi = Math.min(0.95, Math.max(0.05, base * combinedMul + jitter(farmId, mi)));
    const ndvi = parseFloat(rawNdvi.toFixed(4));
    const ndwi = parseFloat(Math.min(0.9, Math.max(-0.2, ndvi * 0.72 + jitter(farmId, mi + 24, 0.02))).toFixed(4));
    const evi  = parseFloat(Math.min(0.9, Math.max(0.05, ndvi * 0.88 + jitter(farmId, mi + 48, 0.015))).toFixed(4));
    return { month, ndvi, ndwi, evi };
  });

  // Current + recent trend
  const curNDVI   = timeSeries[curMonth].ndvi;
  const prevNDVI  = timeSeries[(curMonth + 11) % 12].ndvi;
  const trend: ComputedNDVI["trend"] =
    curNDVI - prevNDVI > 0.04 ? "increasing" :
    prevNDVI - curNDVI > 0.04 ? "decreasing" : "stable";

  const healthStatus: ComputedNDVI["healthStatus"] =
    curNDVI >= 0.70 ? "dense" :
    curNDVI >= 0.55 ? "very_healthy" :
    curNDVI >= 0.35 ? "healthy" :
    curNDVI >= 0.15 ? "moderate" : "sparse";

  // Derived bands for current month
  const cur = timeSeries[curMonth];
  const savi = parseFloat(Math.min(0.9, Math.max(0.05, curNDVI * 0.92 + jitter(farmId, curMonth + 72, 0.01))).toFixed(4));
  const vegCov = Math.min(98, Math.max(5, Math.round(curNDVI * 110 + farmSeed(farmId, 3) * 8)));
  const moisture = parseFloat(Math.min(0.95, Math.max(0.05, cur.ndwi + 0.25 + jitter(farmId, curMonth + 96, 0.02))).toFixed(3));
  const cloud = Math.max(0, Math.round(farmSeed(farmId, 7) * 12));

  return {
    current: {
      ndvi: curNDVI,
      ndwi: cur.ndwi,
      evi: cur.evi,
      savi,
      vegetationCoverage: vegCov,
      moistureIndex: moisture,
      cloudCoverage: cloud,
    },
    timeSeries,
    healthStatus,
    trend,
    source: "computed",
    computedAt: now.toISOString(),
  };
}

export function ndviStatusLabel(status: ComputedNDVI["healthStatus"]): string {
  return {
    sparse:      "Sparse",
    moderate:    "Moderate",
    healthy:     "Healthy",
    very_healthy:"Very Healthy",
    dense:       "Dense",
  }[status];
}

export function ndviBadgeVariant(ndvi: number): "green" | "yellow" | "red" | "blue" | "gray" {
  if (ndvi >= 0.55) return "green";
  if (ndvi >= 0.35) return "yellow";
  return "red";
}
