import { NextRequest, NextResponse } from "next/server";
import { getFarm, saveWeatherAnalytics } from "@/lib/firestore";
import { fetchWeatherForLocation } from "@/lib/monitoring/weather-engine";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      farmId?: string;
      userId?: string;
      lat?: number;
      lng?: number;
    };
    const { farmId, userId, lat, lng } = body;

    let latitude = lat;
    let longitude = lng;

    if (farmId) {
      const farm = await getFarm(farmId);
      if (!farm) {
        return NextResponse.json({ error: "Farm not found" }, { status: 404 });
      }
      latitude = farm.coordinates.lat;
      longitude = farm.coordinates.lng;
    }

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "latitude and longitude required" },
        { status: 400 }
      );
    }

    const weather = await fetchWeatherForLocation(latitude, longitude);
    if (!weather) {
      return NextResponse.json(
        { error: "Weather data unavailable" },
        { status: 503 }
      );
    }

    // Persist if we have farmId + userId
    if (farmId && userId) {
      await saveWeatherAnalytics({ farmId, userId, ...weather });
    }

    return NextResponse.json(weather);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
