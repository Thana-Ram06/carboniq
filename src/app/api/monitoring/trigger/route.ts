/**
 * Monitoring Trigger — VASUDHA Phase 4
 *
 * Runs full intelligence pipeline for specified farms.
 * Can be called by:
 *   • Vercel Cron (GET with ?userId=all) — triggered by vercel.json schedule
 *   • Manual dispatch (POST with { farmIds, userId })
 *
 * Runs: NDVI scan → weather fetch → risk assessment → timeline events → Firestore persist
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getFarm,
  saveSatelliteScan,
  saveFarmInsights,
  saveVegetationScore,
  saveNDVIHistory,
  saveWeatherAnalytics,
  saveRiskAssessment,
  saveCarbonAnalytics,
  addFarmTimelineEvent,
  updateFarmMonitoringConfig,
} from "@/lib/firestore";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import {
  isSentinelHubConfigured,
  fetchNDVIFromSentinelHub,
} from "@/lib/satellite/sentinel-hub";
import { computeHealthScore } from "@/lib/intelligence/health-scoring";
import { generateInsights } from "@/lib/intelligence/insights-engine";
import { computeSeasonalBaseline } from "@/lib/intelligence/historical-analytics";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { fetchWeatherForLocation } from "@/lib/monitoring/weather-engine";
import { assessRisk } from "@/lib/monitoring/risk-engine";
import {
  computeNextScanDate,
} from "@/lib/monitoring/scheduler";

async function runScanForFarm(
  farmId: string,
  userId: string,
  triggeredBy: "auto" | "manual" | "cron" = "auto"
) {
  const farm = await getFarm(farmId);
  if (!farm) throw new Error(`Farm ${farmId} not found`);

  // 1. NDVI
  let ndvi: number, ndwi: number, evi: number, savi: number;
  let ndviSource: "sentinel_hub" | "computed" = "computed";
  if (farm.boundary && isSentinelHubConfigured()) {
    const r = await fetchNDVIFromSentinelHub(farm.boundary);
    if (r) {
      ndvi = r.ndvi; ndwi = r.ndwi; evi = r.evi; savi = r.savi;
      ndviSource = "sentinel_hub";
    } else {
      const c = computeFarmNDVI({ farmId, cropType: farm.cropType, irrigationType: farm.irrigationType, state: farm.state });
      ndvi = c.current.ndvi; ndwi = c.current.ndwi; evi = c.current.evi; savi = c.current.savi;
    }
  } else {
    const c = computeFarmNDVI({ farmId, cropType: farm.cropType, irrigationType: farm.irrigationType, state: farm.state });
    ndvi = c.current.ndvi; ndwi = c.current.ndwi; evi = c.current.evi; savi = c.current.savi;
  }

  // 2. Weather
  const weather = await fetchWeatherForLocation(
    farm.coordinates.lat,
    farm.coordinates.lng
  );

  // 3. Intelligence
  const healthScore = computeHealthScore(ndvi);
  const carbon = computeCarbonIntelligence(farm, ndvi);
  const baseline = computeSeasonalBaseline(farm.state, farm.cropType, new Date().getMonth());
  const insights = generateInsights(farm, ndvi, undefined, baseline);
  const risk = assessRisk(farm, ndvi, weather);

  const moistureIndex = parseFloat((((ndwi + 1) / 2) * 100).toFixed(1));

  // 4. Persist all
  const interval = (farm as typeof farm & { monitoring?: { interval?: string } }).monitoring?.interval ?? "weekly";
  const nowIso = new Date().toISOString();

  await Promise.all([
    saveSatelliteScan({
      farmId, userId, ndvi, ndwi, evi, savi,
      vegetationCoverage: carbon.vegetationCoverage,
      moistureIndex, cloudCoverage: 0,
      healthStatus: healthScore.label,
      trend: "stable",
      source: ndviSource,
    }),
    saveFarmInsights({ farmId, userId, insights }),
    saveVegetationScore({ farmId, userId, ...healthScore }),
    saveNDVIHistory({ farmId, userId, ndvi, evi, source: ndviSource }),
    saveCarbonAnalytics({ farmId, userId, ...carbon }),
    weather ? saveWeatherAnalytics({ farmId, userId, ...weather }) : Promise.resolve(),
    saveRiskAssessment({ farmId, userId, ...risk }),
    addFarmTimelineEvent({
      farmId, userId,
      type: "scan",
      title: `Automated scan completed`,
      description: `NDVI ${ndvi.toFixed(3)} · Health: ${healthScore.label} · Risk: ${risk.severity}`,
      severity: risk.severity,
      metadata: { ndvi, healthScore: healthScore.score, overallRisk: risk.overallRisk },
    }),
    ...(risk.alerts.length > 0
      ? [addFarmTimelineEvent({
          farmId, userId,
          type: "alert",
          title: risk.alerts[0].title,
          description: risk.alerts[0].description,
          severity: risk.alerts[0].severity,
        })]
      : []),
    updateFarmMonitoringConfig(farmId, {
      interval: interval as "daily" | "weekly" | "monthly",
      autoEnabled: true,
      lastScanAt: nowIso,
      nextScanAt: computeNextScanDate(interval as "daily" | "weekly" | "monthly", nowIso),
    }),
  ]);

  return {
    farmId,
    farmName: farm.name,
    ndvi,
    healthScore: healthScore.label,
    riskSeverity: risk.severity,
    overallRisk: risk.overallRisk,
    alertCount: risk.alerts.length,
    weather: weather
      ? { rainfall7d: weather.rainfall7d, avgMaxTemp: weather.avgMaxTemp, droughtScore: weather.droughtScore }
      : null,
    source: ndviSource,
    triggeredBy,
    scannedAt: nowIso,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      farmIds?: string[];
      userId?: string;
      triggeredBy?: "auto" | "manual" | "cron";
    };
    const { farmIds, userId, triggeredBy = "manual" } = body;

    if (!farmIds?.length || !userId) {
      return NextResponse.json(
        { error: "farmIds[] and userId required" },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      farmIds.map((id) => runScanForFarm(id, userId, triggeredBy))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").map(
      (r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof runScanForFarm>>>).value
    );
    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r, i) => ({
        farmId: farmIds[i],
        error: (r as PromiseRejectedResult).reason?.message ?? "Unknown",
      }));

    return NextResponse.json({
      processed: results.length,
      succeeded: succeeded.length,
      failed: failed.length,
      results: succeeded,
      errors: failed,
      triggeredAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Trigger failed" },
      { status: 500 }
    );
  }
}

// Vercel Cron entry point (GET)
export async function GET() {
  return NextResponse.json({
    service: "VASUDHA Monitoring Trigger",
    note: "Use POST with { farmIds, userId } to trigger scans",
    scheduledAt: new Date().toISOString(),
  });
}
