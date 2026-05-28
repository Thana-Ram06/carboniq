/**
 * IMD Weather Data Integration — VASUDHA Phase 10
 *
 * India Meteorological Department station data and seasonal forecasts.
 * Based on IMD Open Data API structure (https://imdpune.gov.in).
 * Production implementation should call IMD Griddap/MOSDAC APIs.
 */

import type { IMDWeatherStation, IMDWeatherObservation, IMDSeasonalForecast } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const STATE_STATIONS: Record<string, IMDWeatherStation[]> = {
  "Punjab": [
    { stationId: "PB001", stationName: "Ludhiana", state: "Punjab", district: "Ludhiana", latitude: 30.90, longitude: 75.85, elevation: 244 },
    { stationId: "PB002", stationName: "Amritsar", state: "Punjab", district: "Amritsar", latitude: 31.63, longitude: 74.87, elevation: 234 },
  ],
  "Maharashtra": [
    { stationId: "MH001", stationName: "Pune", state: "Maharashtra", district: "Pune", latitude: 18.52, longitude: 73.86, elevation: 559 },
    { stationId: "MH002", stationName: "Nashik", state: "Maharashtra", district: "Nashik", latitude: 20.00, longitude: 73.79, elevation: 565 },
    { stationId: "MH003", stationName: "Nagpur", state: "Maharashtra", district: "Nagpur", latitude: 21.15, longitude: 79.08, elevation: 310 },
  ],
  "Rajasthan": [
    { stationId: "RJ001", stationName: "Jaipur", state: "Rajasthan", district: "Jaipur", latitude: 26.91, longitude: 75.79, elevation: 431 },
    { stationId: "RJ002", stationName: "Jodhpur", state: "Rajasthan", district: "Jodhpur", latitude: 26.30, longitude: 73.02, elevation: 224 },
  ],
  "Uttar Pradesh": [
    { stationId: "UP001", stationName: "Lucknow", state: "Uttar Pradesh", district: "Lucknow", latitude: 26.85, longitude: 80.95, elevation: 123 },
    { stationId: "UP002", stationName: "Agra", state: "Uttar Pradesh", district: "Agra", latitude: 27.18, longitude: 78.02, elevation: 170 },
  ],
};

const DEFAULT_STATIONS: IMDWeatherStation[] = [
  { stationId: "DEF001", stationName: "New Delhi", state: "Delhi", district: "Delhi", latitude: 28.61, longitude: 77.21, elevation: 216 },
];

export function getStationsForState(state: string): IMDWeatherStation[] {
  return STATE_STATIONS[state] ?? DEFAULT_STATIONS;
}

const MONTH_NORMALS: Record<string, { maxC: number; minC: number; rainMm: number }> = {
  Jan: { maxC: 20, minC: 8, rainMm: 14 },
  Feb: { maxC: 23, minC: 11, rainMm: 12 },
  Mar: { maxC: 29, minC: 16, rainMm: 13 },
  Apr: { maxC: 35, minC: 21, rainMm: 6 },
  May: { maxC: 38, minC: 25, rainMm: 12 },
  Jun: { maxC: 34, minC: 24, rainMm: 98 },
  Jul: { maxC: 30, minC: 23, rainMm: 212 },
  Aug: { maxC: 29, minC: 23, rainMm: 198 },
  Sep: { maxC: 30, minC: 22, rainMm: 120 },
  Oct: { maxC: 30, minC: 18, rainMm: 32 },
  Nov: { maxC: 26, minC: 13, rainMm: 14 },
  Dec: { maxC: 21, minC: 9, rainMm: 10 },
};

export function getWeatherObservations(stationId: string, monthsBack = 6): IMDWeatherObservation[] {
  const now = new Date();
  const obs: IMDWeatherObservation[] = [];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const mLabel = months[d.getMonth()];
    const norm = MONTH_NORMALS[mLabel];
    const seed = seedHash(`${stationId}-${d.getFullYear()}-${d.getMonth()}`);

    obs.push({
      stationId,
      stationName: stationId,
      date: d.toISOString().split("T")[0],
      maxTempC: parseFloat(sf(seed, norm.maxC - 3, norm.maxC + 3).toFixed(1)),
      minTempC: parseFloat(sf(seed + 1, norm.minC - 2, norm.minC + 2).toFixed(1)),
      rainfallMm: parseFloat(Math.max(0, sf(seed + 2, norm.rainMm * 0.5, norm.rainMm * 1.5)).toFixed(1)),
      relativeHumidityPct: Math.round(sf(seed + 3, 45, 88)),
      windSpeedKmh: parseFloat(sf(seed + 4, 8, 28).toFixed(1)),
      solarRadiationMJm2: parseFloat(sf(seed + 5, 12, 26).toFixed(1)),
    });
  }
  return obs;
}

const SEASONAL_RAINFALL_DEPARTURES: Record<string, number> = {
  "Punjab": -8, "Haryana": -12, "Uttar Pradesh": 5, "Madhya Pradesh": 3,
  "Maharashtra": -5, "Gujarat": 8, "Karnataka": 2, "Andhra Pradesh": -3,
  "Telangana": 1, "Bihar": -6, "West Bengal": 12, "Tamil Nadu": 15,
  "Rajasthan": -18, "Odisha": 9, "Chhattisgarh": 4, "Kerala": 18,
};

export function getSeasonalForecast(state: string): IMDSeasonalForecast {
  const now = new Date();
  const month = now.getMonth();
  const season = month >= 5 && month <= 9 ? "Kharif" : month >= 10 || month <= 1 ? "Rabi" : "Zaid";
  const year = now.getFullYear();
  const seed = seedHash(`${state}-${season}-${year}`);
  const rainfallDep = SEASONAL_RAINFALL_DEPARTURES[state] ?? sf(seed, -15, 15);

  return {
    season,
    year,
    state,
    rainfallDeparturePct: Math.round(rainfallDep),
    temperatureAnomalyC: parseFloat(sf(seed + 1, -0.8, 1.2).toFixed(1)),
    droughtProbability: Math.round(Math.max(0, Math.min(100, 20 - rainfallDep * 0.8))),
    floodProbability: Math.round(Math.max(0, Math.min(100, 10 + rainfallDep * 0.4))),
    forecastConfidence: Math.round(sf(seed + 2, 62, 84)),
    issuedDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0],
  };
}
