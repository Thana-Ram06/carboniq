export interface NDVIDataPoint {
  date: string;
  ndvi: number;
  evi?: number;
  source: string;
}

export interface VegetationTrend {
  direction: "improving" | "declining" | "stable";
  slope: number;
  r2: number;
  label: string;
}

export function computeTrend(history: NDVIDataPoint[]): VegetationTrend {
  if (history.length < 2) {
    return { direction: "stable", slope: 0, r2: 0, label: "Insufficient data" };
  }

  const n = history.length;
  const xs = history.map((_, i) => i);
  const ys = history.map((p) => p.ndvi);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const slope =
    (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);

  const meanY = sumY / n;
  const ssTot = ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
  const yhat = xs.map((x) => meanY + slope * (x - sumX / n));
  const ssRes = ys.reduce((acc, y, i) => acc + (y - yhat[i]) ** 2, 0);
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

  const direction =
    slope > 0.005 ? "improving" : slope < -0.005 ? "declining" : "stable";

  const label =
    direction === "improving"
      ? `Improving +${(slope * 30).toFixed(3)}/mo`
      : direction === "declining"
      ? `Declining ${(slope * 30).toFixed(3)}/mo`
      : "Stable trend";

  return {
    direction,
    slope: parseFloat(slope.toFixed(5)),
    r2: parseFloat(r2.toFixed(3)),
    label,
  };
}

// Regional NDVI baselines derived from MODIS MOD13A2 climatology for Indian states
const STATE_BASELINES: Record<string, number> = {
  Punjab: 0.68,
  Haryana: 0.62,
  "Uttar Pradesh": 0.58,
  "Madhya Pradesh": 0.54,
  Maharashtra: 0.52,
  Karnataka: 0.48,
  "Andhra Pradesh": 0.50,
  "Tamil Nadu": 0.52,
  Gujarat: 0.45,
  Rajasthan: 0.38,
  Bihar: 0.56,
  "West Bengal": 0.65,
  Odisha: 0.55,
  Chhattisgarh: 0.56,
  Jharkhand: 0.52,
  Kerala: 0.70,
  Telangana: 0.50,
};

export function computeSeasonalBaseline(
  state: string,
  cropType: string,
  month: number
): number {
  const stateBase = STATE_BASELINES[state] ?? 0.50;
  const cropLower = cropType.toLowerCase();

  const isKharif = month >= 5 && month <= 10;
  const isRabi = month >= 10 || month <= 3;

  const isPeakSeason =
    (isKharif &&
      (cropLower.includes("rice") ||
        cropLower.includes("cotton") ||
        cropLower.includes("maize") ||
        cropLower.includes("soybean") ||
        cropLower.includes("groundnut"))) ||
    (isRabi &&
      (cropLower.includes("wheat") || cropLower.includes("mustard")));

  return parseFloat(
    (stateBase * (isPeakSeason ? 1.1 : 0.85)).toFixed(3)
  );
}
