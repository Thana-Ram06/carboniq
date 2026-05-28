/**
 * Weather Intelligence Engine — VASUDHA Phase 4
 *
 * Fetches 7-day weather data from Open-Meteo (free, no API key).
 * Computes drought score, heat stress, and moisture deficit for risk assessment.
 *
 * API: https://open-meteo.com — 10,000 requests/day free tier.
 * Server-side only — called from API routes, never from client components.
 */

export interface WeatherData {
  rainfall7d: number;      // mm precipitation last 7 days
  avgMaxTemp: number;      // °C average daily max last 7 days
  avgMinTemp: number;      // °C average daily min last 7 days
  avgET0: number;          // mm/day average evapotranspiration
  moistureDeficit: number; // ET0*7 - rainfall (positive = deficit)
  droughtScore: number;    // 0–100
  heatStressScore: number; // 0–100
  forecastRain3d: number;  // mm expected next 3 days
  fetchedAt: string;
  source: "open_meteo";
}

interface OpenMeteoResponse {
  daily: {
    time: string[];
    precipitation_sum: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    et0_fao_evapotranspiration: number[];
  };
}

const BASE = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeatherForLocation(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      daily:
        "precipitation_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration",
      past_days: "7",
      forecast_days: "3",
      timezone: "Asia/Kolkata",
    });

    const res = await fetch(`${BASE}?${params}`, {
      next: { revalidate: 3600 }, // cache 1 hour in Next.js
    });
    if (!res.ok) return null;

    const data = (await res.json()) as OpenMeteoResponse;
    const d = data.daily;
    const n = d.time.length;

    // Past 7 days (exclude the 3 forecast days)
    const past = Math.max(0, n - 3);
    const pastSlice = (arr: number[]) =>
      arr.slice(Math.max(0, past - 7), past).filter((v) => v != null);

    const rainfall7d = pastSlice(d.precipitation_sum).reduce(
      (a, b) => a + b,
      0
    );
    const maxTemps = pastSlice(d.temperature_2m_max);
    const minTemps = pastSlice(d.temperature_2m_min);
    const et0s = pastSlice(d.et0_fao_evapotranspiration);

    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const avgMaxTemp = parseFloat(avg(maxTemps).toFixed(1));
    const avgMinTemp = parseFloat(avg(minTemps).toFixed(1));
    const avgET0 = parseFloat(avg(et0s).toFixed(2));
    const moistureDeficit = parseFloat(
      Math.max(0, avgET0 * 7 - rainfall7d).toFixed(1)
    );

    // Forecast rain for next 3 days
    const forecastSlice = d.precipitation_sum.slice(past, past + 3);
    const forecastRain3d = parseFloat(
      forecastSlice.reduce((a, b) => a + (b ?? 0), 0).toFixed(1)
    );

    // Drought score: 0 when rainfall sufficient, 100 when critically dry
    const expectedWeeklyRain = 15; // mm — moderate expectation for India
    const rainDeficit = Math.max(0, expectedWeeklyRain - rainfall7d);
    const droughtScore = Math.min(
      100,
      Math.round((rainDeficit / expectedWeeklyRain) * 60 + (moistureDeficit / 30) * 40)
    );

    // Heat stress: above 35°C starts stressing most crops
    const heatStressScore = Math.min(
      100,
      Math.max(0, Math.round(((avgMaxTemp - 35) / 12) * 100))
    );

    return {
      rainfall7d: parseFloat(rainfall7d.toFixed(1)),
      avgMaxTemp,
      avgMinTemp,
      avgET0,
      moistureDeficit,
      droughtScore,
      heatStressScore,
      forecastRain3d,
      fetchedAt: new Date().toISOString(),
      source: "open_meteo",
    };
  } catch {
    return null;
  }
}

export function interpretWeather(weather: WeatherData): string {
  if (weather.droughtScore >= 70) return "Severe drought conditions";
  if (weather.droughtScore >= 45) return "Moderate moisture stress";
  if (weather.heatStressScore >= 60) return "High heat stress";
  if (weather.rainfall7d >= 30) return "Adequate moisture levels";
  if (weather.forecastRain3d >= 10) return "Rain forecast upcoming";
  return "Normal weather conditions";
}
