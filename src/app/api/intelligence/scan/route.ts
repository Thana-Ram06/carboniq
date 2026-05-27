import { NextRequest, NextResponse } from "next/server";
import { getFarm } from "@/lib/firestore";
import {
  createScanJob,
  updateScanJob,
  saveSatelliteScan,
  saveFarmInsights,
  saveCarbonAnalytics,
  saveVegetationScore,
  saveNDVIHistory,
} from "@/lib/firestore";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import {
  isSentinelHubConfigured,
  fetchNDVIFromSentinelHub,
} from "@/lib/satellite/sentinel-hub";
import { computeHealthScore } from "@/lib/intelligence/health-scoring";
import { generateInsights } from "@/lib/intelligence/insights-engine";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { computeSeasonalBaseline } from "@/lib/intelligence/historical-analytics";

export async function POST(req: NextRequest) {
  let jobId: string | null = null;

  try {
    const body = (await req.json()) as { farmId?: string; userId?: string };
    const { farmId, userId } = body;

    if (!farmId || !userId) {
      return NextResponse.json(
        { error: "farmId and userId are required" },
        { status: 400 }
      );
    }

    const farm = await getFarm(farmId);
    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    jobId = await createScanJob({ farmId, userId });
    await updateScanJob(jobId, { status: "processing" });

    // ── NDVI data acquisition ────────────────────────────────────────────────
    let ndvi: number, ndwi: number, evi: number, savi: number;
    let source: "sentinel_hub" | "computed" = "computed";

    if (farm.boundary && isSentinelHubConfigured()) {
      const result = await fetchNDVIFromSentinelHub(farm.boundary);
      if (result) {
        ndvi = result.ndvi;
        ndwi = result.ndwi;
        evi = result.evi;
        savi = result.savi;
        source = "sentinel_hub";
      } else {
        const c = computeFarmNDVI({
          farmId: farm.id,
          cropType: farm.cropType,
          irrigationType: farm.irrigationType,
          state: farm.state,
        });
        ndvi = c.current.ndvi;
        ndwi = c.current.ndwi;
        evi = c.current.evi;
        savi = c.current.savi;
      }
    } else {
      const c = computeFarmNDVI({
        farmId: farm.id,
        cropType: farm.cropType,
        irrigationType: farm.irrigationType,
        state: farm.state,
      });
      ndvi = c.current.ndvi;
      ndwi = c.current.ndwi;
      evi = c.current.evi;
      savi = c.current.savi;
    }

    // ── Intelligence computation ─────────────────────────────────────────────
    const healthScore = computeHealthScore(ndvi);
    const carbon = computeCarbonIntelligence(farm, ndvi);
    const month = new Date().getMonth();
    const seasonalBaseline = computeSeasonalBaseline(
      farm.state,
      farm.cropType,
      month
    );
    const insights = generateInsights(farm, ndvi, undefined, seasonalBaseline);

    const moistureIndex = parseFloat(
      (((ndwi + 1) / 2) * 100).toFixed(1)
    );

    // ── Persist to Firestore ─────────────────────────────────────────────────
    await Promise.all([
      saveSatelliteScan({
        farmId,
        userId,
        ndvi,
        ndwi,
        evi,
        savi,
        vegetationCoverage: carbon.vegetationCoverage,
        moistureIndex,
        cloudCoverage: 0,
        healthStatus: healthScore.label,
        trend: "stable",
        source,
      }),
      saveFarmInsights({ farmId, userId, insights }),
      saveCarbonAnalytics({ farmId, userId, ...carbon }),
      saveVegetationScore({ farmId, userId, ...healthScore }),
      saveNDVIHistory({ farmId, userId, ndvi, evi, source }),
    ]);

    await updateScanJob(jobId, { status: "completed" });

    return NextResponse.json({
      jobId,
      ndvi,
      ndwi,
      evi,
      savi,
      moistureIndex,
      vegetationCoverage: carbon.vegetationCoverage,
      healthScore,
      insights,
      carbon,
      seasonalBaseline,
      source,
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (jobId) {
      await updateScanJob(jobId, {
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      }).catch(() => undefined);
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "VASUDHA Intelligence Scan Engine",
    version: "3.0",
    sentinelConfigured: isSentinelHubConfigured(),
  });
}
