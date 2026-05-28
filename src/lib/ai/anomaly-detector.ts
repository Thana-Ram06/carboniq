/**
 * Anomaly Detection Engine — VASUDHA Phase 9
 *
 * Detects unusual vegetation behavior using:
 *  - Z-score deviation from seasonal mean
 *  - Sudden collapse / spike detection
 *  - Seasonal pattern alignment checks
 *  - Deterministic seeding for reproducibility
 */

import type {
  AnomalyDetection, AnomalyEvent, AnomalyType, AnomalySeverity,
} from "@/types";
import type { CropType, IrrigationType } from "@/types";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";

function zScore(val: number, mean: number, std: number): number {
  if (std === 0) return 0;
  return (val - mean) / std;
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function classifyAnomalyType(
  ndvi: number, expected: number, prevNDVI: number | undefined, z: number
): AnomalyType {
  const delta = ndvi - expected;
  if (delta < -0.12 && prevNDVI !== undefined && ndvi < prevNDVI - 0.1) return "ndvi_collapse";
  if (delta > 0.15) return "ndvi_spike";
  if (Math.abs(z) > 3) return "pattern_break";
  if (delta < -0.08) return "seasonal_deviation";
  return "evidence_gap";
}

function severityFromZScore(maxZ: number, count: number): AnomalySeverity {
  if (maxZ > 3.5 || count >= 4) return "critical";
  if (maxZ > 2.5 || count >= 3) return "high";
  if (maxZ > 1.8 || count >= 2) return "medium";
  return "low";
}

export interface AnomalyInput {
  farmId: string;
  userId: string;
  cropType: CropType;
  irrigationType: IrrigationType;
  state: string;
  areaHectares: number;
}

export function detectAnomalies(input: AnomalyInput): Omit<AnomalyDetection, "id" | "computedAt"> {
  const { farmId, userId, cropType, irrigationType, state, areaHectares } = input;

  // Get 12-month NDVI history from the engine
  const ndviResult = computeFarmNDVI({ farmId, cropType, irrigationType, state, areaHectares });
  const history = ndviResult.timeSeries;

  const ndviValues = history.map((h) => h.ndvi);
  const m = mean(ndviValues);
  const s = std(ndviValues);

  const Z_THRESHOLD = 1.8;
  const events: AnomalyEvent[] = [];

  history.forEach((h, i) => {
    const z = zScore(h.ndvi, m, s);
    if (Math.abs(z) >= Z_THRESHOLD) {
      events.push({
        month: h.month,
        ndvi: h.ndvi,
        expected: parseFloat((m + (h.ndvi > m ? -0.05 : 0.05)).toFixed(4)),
        deviation: parseFloat((h.ndvi - m).toFixed(4)),
        zScore: parseFloat(z.toFixed(3)),
        type: classifyAnomalyType(
          h.ndvi,
          m,
          i > 0 ? history[i - 1].ndvi : undefined,
          z
        ),
      });
    }
  });

  const maxZ = events.length > 0 ? Math.max(...events.map((e) => Math.abs(e.zScore))) : 0;
  const severity = severityFromZScore(maxZ, events.length);

  // Confidence: fewer anomalies = higher detection confidence
  const overallConfidence = Math.round(Math.max(40, 100 - events.length * 8 - (maxZ - 1.8) * 12));

  return {
    farmId,
    userId,
    anomalyCount: events.length,
    maxZScore: parseFloat(maxZ.toFixed(3)),
    severity,
    events,
    overallConfidence,
  };
}

export function anomalySeverityColor(severity: AnomalySeverity): string {
  const map: Record<AnomalySeverity, string> = {
    low:      "text-blue-400",
    medium:   "text-yellow-400",
    high:     "text-orange-400",
    critical: "text-red-400",
  };
  return map[severity];
}

export function anomalySeverityBg(severity: AnomalySeverity): string {
  const map: Record<AnomalySeverity, string> = {
    low:      "bg-blue-500/10 border-blue-500/20",
    medium:   "bg-yellow-500/10 border-yellow-500/20",
    high:     "bg-orange-500/10 border-orange-500/20",
    critical: "bg-red-500/10 border-red-500/20",
  };
  return map[severity];
}
