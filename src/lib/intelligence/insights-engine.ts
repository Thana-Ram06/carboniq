import type { Farm, Insight, InsightType, InsightSeverity } from "@/types";

export type { Insight, InsightType, InsightSeverity };

export function generateInsights(
  farm: Farm,
  ndvi: number,
  previousNDVI?: number,
  seasonalBaseline?: number
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date().toISOString();
  const month = new Date().getMonth();
  const cropLower = farm.cropType.toLowerCase();

  // 1. Trend analysis
  if (previousNDVI !== undefined) {
    const delta = ndvi - previousNDVI;
    if (delta > 0.05) {
      insights.push({
        id: "trend-improving",
        type: "trend",
        severity: "success",
        title: "Vegetation health improving",
        body: `NDVI increased by ${(delta * 100).toFixed(1)} points since last scan. Active growth cycle detected.`,
        metric: `+${delta.toFixed(3)} NDVI`,
        timestamp: now,
      });
    } else if (delta < -0.05) {
      insights.push({
        id: "trend-declining",
        type: "trend",
        severity: "warning",
        title: "Vegetation decline detected",
        body: `NDVI dropped by ${(Math.abs(delta) * 100).toFixed(1)} points since last scan. Monitor field conditions closely.`,
        metric: `${delta.toFixed(3)} NDVI`,
        timestamp: now,
      });
    }
  }

  // 2. Irrigation stress
  const hasEfficientIrrigation =
    farm.irrigationType === "drip" || farm.irrigationType === "sprinkler";
  if (ndvi < 0.3 && !hasEfficientIrrigation) {
    insights.push({
      id: "irrigation-stress",
      type: "irrigation",
      severity: ndvi < 0.2 ? "critical" : "warning",
      title:
        ndvi < 0.2
          ? "Severe irrigation stress detected"
          : "Potential irrigation stress",
      body: `Low NDVI (${ndvi.toFixed(3)}) with ${farm.irrigationType} irrigation suggests water deficit. Consider supplemental irrigation or upgrade to drip/sprinkler.`,
      metric: `NDVI ${ndvi.toFixed(3)}`,
      timestamp: now,
    });
  }

  // 3. Seasonal comparison
  if (seasonalBaseline !== undefined) {
    const diff = ndvi - seasonalBaseline;
    if (diff < -0.08) {
      insights.push({
        id: "below-seasonal",
        type: "seasonal",
        severity: "warning",
        title: "Seasonal vegetation below regional average",
        body: `Current NDVI is ${(Math.abs(diff) * 100).toFixed(0)} points below the seasonal baseline for ${farm.state}. Crop growth may be lagging.`,
        metric: `Baseline: ${seasonalBaseline.toFixed(3)}`,
        timestamp: now,
      });
    } else if (diff > 0.08) {
      insights.push({
        id: "above-seasonal",
        type: "seasonal",
        severity: "success",
        title: "Above-average seasonal performance",
        body: `Vegetation density ${(Math.abs(diff) * 100).toFixed(0)} points above regional seasonal average. Excellent crop conditions.`,
        metric: `+${diff.toFixed(3)} vs baseline`,
        timestamp: now,
      });
    }
  }

  // 4. NDVI health category insights
  if (ndvi >= 0.65) {
    insights.push({
      id: "high-density",
      type: "vegetation",
      severity: "success",
      title: "High vegetation density",
      body: `Dense canopy coverage detected across ${farm.areaHectares.toFixed(1)} ha. ${farm.cropType} showing peak growth indicators.`,
      metric: `NDVI ${ndvi.toFixed(3)}`,
      timestamp: now,
    });
  } else if (ndvi >= 0.4 && ndvi < 0.65) {
    insights.push({
      id: "stable-health",
      type: "vegetation",
      severity: "info",
      title: "Stable vegetation health",
      body: `${farm.cropType} on ${farm.areaHectares.toFixed(1)} ha showing consistent growth patterns suitable for monitoring.`,
      metric: `NDVI ${ndvi.toFixed(3)}`,
      timestamp: now,
    });
  } else if (ndvi < 0.25) {
    insights.push({
      id: "sparse-vegetation",
      type: "vegetation",
      severity: ndvi < 0.15 ? "critical" : "warning",
      title:
        ndvi < 0.15 ? "Very sparse vegetation detected" : "Low vegetation density",
      body: `Sparse biomass detected. This may indicate early growth stage, land preparation, or crop stress requiring field verification.`,
      metric: `NDVI ${ndvi.toFixed(3)}`,
      timestamp: now,
    });
  }

  // 5. Season mismatch check
  const isKharif = month >= 5 && month <= 10;
  const isRabi = month >= 10 || month <= 3;
  const isKharifCrop =
    cropLower.includes("rice") ||
    cropLower.includes("cotton") ||
    cropLower.includes("maize") ||
    cropLower.includes("soybean") ||
    cropLower.includes("groundnut");
  const isRabiCrop =
    cropLower.includes("wheat") || cropLower.includes("mustard");

  if (isRabi && isKharifCrop) {
    insights.push({
      id: "off-season-kharif",
      type: "seasonal",
      severity: "info",
      title: "Off-season Kharif crop detected",
      body: `${farm.cropType} is typically grown Jun–Nov. If this is summer or Zaid cultivation, expect lower NDVI values than seasonal norms.`,
      timestamp: now,
    });
  } else if (isKharif && isRabiCrop) {
    insights.push({
      id: "off-season-rabi",
      type: "seasonal",
      severity: "info",
      title: "Off-season Rabi crop detected",
      body: `${farm.cropType} is typically grown Oct–Apr. Verify crop type metadata for accurate seasonal analytics.`,
      timestamp: now,
    });
  }

  // 6. Large farm precision note
  if (farm.areaHectares > 50) {
    insights.push({
      id: "large-farm-note",
      type: "boundary",
      severity: "info",
      title: "Large farm — aggregate NDVI in use",
      body: `At ${farm.areaHectares.toFixed(1)} ha, single NDVI value may mask intra-field variation. Sub-polygon zoning recommended for precision analytics.`,
      timestamp: now,
    });
  }

  return insights.slice(0, 5);
}
