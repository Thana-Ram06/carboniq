export interface NDVIDataPoint {
  date: string;
  ndvi: number;
  cloudCover?: number;
}

export interface SmoothedNDVIPoint extends NDVIDataPoint {
  smoothed: number;
  isAnomaly: boolean;
  confidence: number;
  trend: "rising" | "falling" | "stable";
}

export interface NDVITrendAnalysis {
  series: SmoothedNDVIPoint[];
  currentSmoothed: number;
  trendDirection: "rising" | "falling" | "stable";
  anomalyCount: number;
  vegetationReliability: number;
}

/** Exponential Moving Average (alpha controls smoothing strength). */
function ema(values: number[], alpha = 0.3): number[] {
  const result: number[] = [];
  let prev = values[0];
  for (const v of values) {
    const smoothed = alpha * v + (1 - alpha) * prev;
    result.push(smoothed);
    prev = smoothed;
  }
  return result;
}

/** Population std-dev. */
function stdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function smoothNDVISeries(points: NDVIDataPoint[]): NDVITrendAnalysis {
  if (points.length === 0) {
    return {
      series: [],
      currentSmoothed: 0,
      trendDirection: "stable",
      anomalyCount: 0,
      vegetationReliability: 0,
    };
  }

  const rawValues = points.map((p) => p.ndvi);
  const smoothedValues = ema(rawValues, 0.35);
  const sigma = stdDev(rawValues);
  const mean = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;

  const series: SmoothedNDVIPoint[] = points.map((p, i) => {
    const deviation = Math.abs(p.ndvi - mean);
    const isAnomaly = deviation > 2 * sigma && sigma > 0.01;
    const cloudPenalty = p.cloudCover ? Math.min(p.cloudCover / 100, 0.4) : 0;
    const confidence = Math.max(0.2, 1 - cloudPenalty - (isAnomaly ? 0.2 : 0));

    let trend: "rising" | "falling" | "stable" = "stable";
    if (i >= 2) {
      const delta = smoothedValues[i] - smoothedValues[i - 2];
      if (delta > 0.02) trend = "rising";
      else if (delta < -0.02) trend = "falling";
    }

    return { ...p, smoothed: smoothedValues[i], isAnomaly, confidence, trend };
  });

  const last = series[series.length - 1];
  const anomalyCount = series.filter((s) => s.isAnomaly).length;
  const avgConfidence = series.reduce((a, s) => a + s.confidence, 0) / series.length;

  return {
    series,
    currentSmoothed: last?.smoothed ?? 0,
    trendDirection: last?.trend ?? "stable",
    anomalyCount,
    vegetationReliability: Math.round(avgConfidence * 100),
  };
}

/** Score how reliable a single NDVI reading is (0-100). */
export function ndviReadingConfidence(ndvi: number, cloudCover = 0, scanCount = 1): number {
  let score = 100;
  if (cloudCover > 30) score -= 20;
  if (cloudCover > 60) score -= 20;
  if (scanCount < 3) score -= 15;
  if (ndvi < 0 || ndvi > 0.95) score -= 25; // suspect reading
  return Math.max(0, score);
}

/** Return color class based on NDVI trend. */
export function trendColor(trend: "rising" | "falling" | "stable"): string {
  if (trend === "rising") return "text-green-400";
  if (trend === "falling") return "text-red-400";
  return "text-yellow-400";
}
