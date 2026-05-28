import type { Farm } from "@/types";
import type { WeatherData } from "./weather-engine";
import { computeSeasonalBaseline } from "@/lib/intelligence/historical-analytics";

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskAlertType =
  | "drought"
  | "heat_stress"
  | "vegetation_decline"
  | "irrigation_stress"
  | "anomaly"
  | "seasonal_lag";

export interface RiskAlert {
  id: string;
  type: RiskAlertType;
  severity: RiskSeverity;
  title: string;
  description: string;
  metric?: string;
  generatedAt: string;
}

export interface RiskAssessment {
  overallRisk: number;
  severity: RiskSeverity;
  droughtRisk: number;
  vegetationDeclineRisk: number;
  heatStressRisk: number;
  irrigationStressRisk: number;
  alerts: RiskAlert[];
  confidence: "low" | "medium" | "high";
  computedAt: string;
}

function severity(score: number): RiskSeverity {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function assessRisk(
  farm: Farm,
  ndvi: number,
  weather: WeatherData | null,
  previousNdvi?: number
): RiskAssessment {
  const now = new Date().toISOString();
  const alerts: RiskAlert[] = [];
  const month = new Date().getMonth();

  // ── Drought risk ──────────────────────────────────────────────────────────
  let droughtRisk = 0;
  if (weather) {
    droughtRisk = Math.min(100, Math.round(
      weather.droughtScore * 0.5 +
      (ndvi < 0.3 ? (0.3 - ndvi) / 0.3 * 50 : 0)
    ));
    if (droughtRisk >= 50) {
      alerts.push({
        id: "drought-alert",
        type: "drought",
        severity: severity(droughtRisk),
        title:
          droughtRisk >= 75
            ? "Severe drought risk detected"
            : "Drought stress developing",
        description: `Only ${weather.rainfall7d}mm rain in last 7 days with ${weather.moistureDeficit}mm moisture deficit. Current NDVI ${ndvi.toFixed(3)} indicates vegetation stress.`,
        metric: `${weather.rainfall7d}mm / 7d`,
        generatedAt: now,
      });
    }
  } else {
    // Estimate drought risk from NDVI alone
    if (ndvi < 0.25) {
      droughtRisk = Math.round((0.25 - ndvi) / 0.25 * 60);
    }
  }

  // ── Heat stress risk ──────────────────────────────────────────────────────
  let heatStressRisk = 0;
  if (weather && weather.heatStressScore > 0) {
    heatStressRisk = weather.heatStressScore;
    if (heatStressRisk >= 40) {
      alerts.push({
        id: "heat-stress",
        type: "heat_stress",
        severity: severity(heatStressRisk),
        title: "Heat stress conditions",
        description: `Average maximum temperature ${weather.avgMaxTemp}°C exceeds optimal range. Monitor crop transpiration and consider irrigation adjustment.`,
        metric: `${weather.avgMaxTemp}°C avg max`,
        generatedAt: now,
      });
    }
  }

  // ── Vegetation decline risk ───────────────────────────────────────────────
  let vegetationDeclineRisk = 0;
  const baseline = computeSeasonalBaseline(farm.state, farm.cropType, month);
  if (ndvi < baseline * 0.75) {
    vegetationDeclineRisk = Math.min(
      100,
      Math.round(((baseline - ndvi) / baseline) * 100)
    );
    if (vegetationDeclineRisk >= 30) {
      alerts.push({
        id: "veg-decline",
        type: "vegetation_decline",
        severity: severity(vegetationDeclineRisk),
        title: "Vegetation below seasonal baseline",
        description: `NDVI ${ndvi.toFixed(3)} is ${Math.round((1 - ndvi / baseline) * 100)}% below the ${farm.state} seasonal average (${baseline.toFixed(3)}) for ${farm.cropType}.`,
        metric: `${Math.round((baseline - ndvi) * 100)} pts below baseline`,
        generatedAt: now,
      });
    }
  }
  if (previousNdvi !== undefined && previousNdvi - ndvi > 0.08) {
    const declineExtra = Math.min(40, Math.round((previousNdvi - ndvi) / 0.15 * 40));
    vegetationDeclineRisk = Math.min(100, vegetationDeclineRisk + declineExtra);
    alerts.push({
      id: "ndvi-drop",
      type: "vegetation_decline",
      severity: severity(declineExtra + 20),
      title: "Rapid NDVI decline",
      description: `NDVI dropped from ${previousNdvi.toFixed(3)} to ${ndvi.toFixed(3)} — a ${((previousNdvi - ndvi) * 100).toFixed(1)} point decline. Investigate field conditions.`,
      metric: `-${((previousNdvi - ndvi)).toFixed(3)} NDVI`,
      generatedAt: now,
    });
  }

  // ── Irrigation stress risk ────────────────────────────────────────────────
  const hasEfficientIrrigation =
    farm.irrigationType === "drip" || farm.irrigationType === "sprinkler";
  let irrigationStressRisk = 0;
  if (ndvi < 0.30 && !hasEfficientIrrigation) {
    irrigationStressRisk = Math.min(
      100,
      Math.round((0.30 - ndvi) / 0.30 * 80 + (droughtRisk > 40 ? 20 : 0))
    );
    if (irrigationStressRisk >= 35) {
      alerts.push({
        id: "irrigation-stress",
        type: "irrigation_stress",
        severity: severity(irrigationStressRisk),
        title: "Irrigation stress — efficiency gap",
        description: `${farm.irrigationType} irrigation with NDVI ${ndvi.toFixed(3)} suggests water deficit. ${weather && weather.forecastRain3d < 5 ? "No significant rainfall forecast for next 3 days. " : ""}Upgrade to drip/sprinkler could improve water use efficiency by 15-20%.`,
        metric: `NDVI ${ndvi.toFixed(3)} · ${farm.irrigationType}`,
        generatedAt: now,
      });
    }
  }

  // ── Overall risk ──────────────────────────────────────────────────────────
  const scores = [droughtRisk, heatStressRisk, vegetationDeclineRisk, irrigationStressRisk];
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const overallRisk = Math.round(maxScore * 0.55 + avgScore * 0.45);

  const confidence =
    weather ? "high" : previousNdvi !== undefined ? "medium" : "low";

  return {
    overallRisk,
    severity: severity(overallRisk),
    droughtRisk,
    vegetationDeclineRisk,
    heatStressRisk,
    irrigationStressRisk,
    alerts: alerts.slice(0, 4),
    confidence,
    computedAt: now,
  };
}

export function riskSeverityColor(severity: RiskSeverity): string {
  return {
    low: "#4ade80",
    medium: "#fbbf24",
    high: "#f97316",
    critical: "#ef4444",
  }[severity];
}

export function riskSeverityBg(severity: RiskSeverity): string {
  return {
    low: "bg-green-500/10 border-green-500/20 text-green-400",
    medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    critical: "bg-red-500/10 border-red-500/20 text-red-400",
  }[severity];
}
