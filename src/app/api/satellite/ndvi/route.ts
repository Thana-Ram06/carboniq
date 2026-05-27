import { type NextRequest, NextResponse } from "next/server";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { fetchNDVIFromSentinelHub, isSentinelHubConfigured } from "@/lib/satellite/sentinel-hub";
import type { CropType, IrrigationType, FarmBoundary } from "@/types";

export interface NDVIRequest {
  farmId: string;
  cropType: CropType;
  irrigationType: IrrigationType;
  state: string;
  boundary?: FarmBoundary;
  date?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NDVIRequest;
    const { farmId, cropType, irrigationType, state, boundary, date } = body;

    if (!farmId || !cropType || !irrigationType || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Try Sentinel Hub first (real satellite data)
    if (boundary && isSentinelHubConfigured()) {
      const real = await fetchNDVIFromSentinelHub(boundary, date);
      if (real) {
        return NextResponse.json({
          ...real,
          farmId,
          // Build minimal timeSeries from current value only
          timeSeries: null,
        });
      }
    }

    // Fallback: deterministic computed NDVI
    const computed = computeFarmNDVI({ farmId, cropType, irrigationType, state });

    return NextResponse.json({
      farmId,
      ...computed.current,
      source: computed.source,
      timeSeries: computed.timeSeries,
      healthStatus: computed.healthStatus,
      trend: computed.trend,
      computedAt: computed.computedAt,
      sentinelConfigured: isSentinelHubConfigured(),
    });
  } catch (err) {
    console.error("[satellite/ndvi]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    sentinelConfigured: isSentinelHubConfigured(),
    info: "POST { farmId, cropType, irrigationType, state, boundary?, date? }",
  });
}
