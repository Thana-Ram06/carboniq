import type { ModelAccuracyMetric, NDVIAccuracyRecord, ForecastAccuracyRecord } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export function getModelAccuracyMetrics(): ModelAccuracyMetric[] {
  const models = [
    { name: "NDVI Biomass Estimator", version: "v3.2.1", ds: 12400, bench: "passing" as const },
    { name: "Carbon Sequestration Model", version: "v2.8.0", ds: 9800, bench: "passing" as const },
    { name: "Drought Probability Forecaster", version: "v4.1.0", ds: 7300, bench: "passing" as const },
    { name: "Anomaly Detector (Sentinel-2)", version: "v1.9.3", ds: 15200, bench: "marginal" as const },
    { name: "Yield Index Predictor", version: "v2.0.1", ds: 6100, bench: "passing" as const },
  ];
  return models.map((m, i) => {
    const seed = seedHash(m.name);
    return {
      modelName: m.name,
      version: m.version,
      datasetSize: m.ds,
      ndviR2: parseFloat(sf(seed, 0.88, 0.97).toFixed(3)),
      carbonR2: parseFloat(sf(seed + 1, 0.82, 0.95).toFixed(3)),
      droughtAUC: parseFloat(sf(seed + 2, 0.84, 0.96).toFixed(3)),
      anomalyPrecision: parseFloat(sf(seed + 3, 0.78, 0.94).toFixed(3)),
      anomalyRecall: parseFloat(sf(seed + 4, 0.72, 0.91).toFixed(3)),
      evaluatedAt: new Date(Date.now() - i * 7 * 86400000).toISOString(),
      benchmark: m.bench,
    };
  });
}

export function getNDVIAccuracyRecords(): NDVIAccuracyRecord[] {
  const districts = [
    { d: "Nashik", s: "Maharashtra" }, { d: "Ludhiana", s: "Punjab" }, { d: "Anand", s: "Gujarat" },
    { d: "Warangal", s: "Telangana" }, { d: "Coimbatore", s: "Tamil Nadu" }, { d: "Bhopal", s: "Madhya Pradesh" },
    { d: "Jaipur", s: "Rajasthan" }, { d: "Mysuru", s: "Karnataka" }, { d: "Guntur", s: "Andhra Pradesh" },
  ];
  const seasons = ["Kharif 2025", "Rabi 2025-26"];
  return districts.flatMap((loc, i) =>
    seasons.map((season, j) => {
      const seed = seedHash(`${loc.d}-${season}`);
      const sentinel = parseFloat(sf(seed, 0.35, 0.80).toFixed(3));
      const field = parseFloat((sentinel + sf(seed + 1, -0.06, 0.06)).toFixed(3));
      const absErr = parseFloat(Math.abs(sentinel - field).toFixed(3));
      return {
        district: loc.d,
        state: loc.s,
        sentinelNDVI: sentinel,
        fieldNDVI: field,
        absoluteError: absErr,
        percentError: parseFloat(((absErr / field) * 100).toFixed(2)),
        sampleCount: Math.floor(sf(seed + 2, 15, 80)),
        season,
        year: j === 0 ? 2025 : 2026,
      };
    })
  );
}

export function getForecastAccuracyRecords(): ForecastAccuracyRecord[] {
  const horizons = [7, 14, 30, 60, 90];
  const params: ForecastAccuracyRecord["parameter"][] = ["drought_prob", "ndvi_change", "yield_index"];
  return horizons.flatMap((h) =>
    params.map((param) => {
      const seed = seedHash(`${h}-${param}`);
      return {
        horizonDays: h,
        parameter: param,
        mae: parseFloat(sf(seed, 0.04 + h * 0.001, 0.15 + h * 0.002).toFixed(4)),
        rmse: parseFloat(sf(seed + 1, 0.06 + h * 0.001, 0.20 + h * 0.003).toFixed(4)),
        bias: parseFloat(sf(seed + 2, -0.03, 0.03).toFixed(4)),
        skillScore: parseFloat(sf(seed + 3, 0.55 - h * 0.003, 0.92 - h * 0.002).toFixed(3)),
        evaluationPeriod: "Jan 2025 – Mar 2026",
      };
    })
  );
}

export function getAccuracySummary() {
  const metrics = getModelAccuracyMetrics();
  const passing = metrics.filter((m) => m.benchmark === "passing").length;
  return {
    totalModels: metrics.length,
    passingModels: passing,
    marginalModels: metrics.filter((m) => m.benchmark === "marginal").length,
    failingModels: metrics.filter((m) => m.benchmark === "failing").length,
    avgNDVIR2: parseFloat((metrics.reduce((a, m) => a + m.ndviR2, 0) / metrics.length).toFixed(3)),
    avgCarbonR2: parseFloat((metrics.reduce((a, m) => a + m.carbonR2, 0) / metrics.length).toFixed(3)),
    lastEvaluated: metrics[0]?.evaluatedAt ?? new Date().toISOString(),
  };
}
