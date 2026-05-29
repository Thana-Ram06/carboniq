import type { CrossStateNDVITrend, DroughtRiskAggregation, CropIntelligence } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const STATES = ["Maharashtra", "Punjab", "Gujarat", "Madhya Pradesh", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Telangana", "Rajasthan"];

export function getCrossStateNDVITrends(): CrossStateNDVITrend[] {
  return STATES.flatMap((state) =>
    ["Kharif 2025", "Rabi 2025-26"].map((season) => {
      const seed = seedHash(`${state}-${season}-ndvi`);
      const base = sf(seed, 0.38, 0.70);
      return {
        state,
        season,
        ndviQ1: parseFloat((base + sf(seed + 1, -0.05, 0.05)).toFixed(3)),
        ndviQ2: parseFloat((base + sf(seed + 2, 0.02, 0.12)).toFixed(3)),
        ndviQ3: parseFloat((base + sf(seed + 3, -0.02, 0.08)).toFixed(3)),
        ndviQ4: parseFloat((base + sf(seed + 4, -0.08, 0.02)).toFixed(3)),
        yoyChange: parseFloat(sf(seed + 5, -5, 12).toFixed(2)),
        cropHealthIndex: parseFloat(sf(seed + 6, 62, 96).toFixed(1)),
      };
    })
  );
}

const DROUGHT_ZONES = [
  { d: "Jalgaon", s: "Maharashtra", risk: "high" as const },
  { d: "Latur", s: "Maharashtra", risk: "critical" as const },
  { d: "Barmer", s: "Rajasthan", risk: "critical" as const },
  { d: "Jaisalmer", s: "Rajasthan", risk: "high" as const },
  { d: "Anand", s: "Gujarat", risk: "medium" as const },
  { d: "Ludhiana", s: "Punjab", risk: "low" as const },
  { d: "Mysuru", s: "Karnataka", risk: "low" as const },
  { d: "Warangal", s: "Telangana", risk: "medium" as const },
  { d: "Surat", s: "Gujarat", risk: "low" as const },
  { d: "Bhopal", s: "Madhya Pradesh", risk: "medium" as const },
  { d: "Indore", s: "Madhya Pradesh", risk: "low" as const },
  { d: "Nashik", s: "Maharashtra", risk: "medium" as const },
];

export function getDroughtRiskAggregations(): DroughtRiskAggregation[] {
  return DROUGHT_ZONES.map((z) => {
    const seed = seedHash(`${z.d}-drought`);
    const riskMultiplier = { low: 0.3, medium: 0.55, high: 0.75, critical: 0.92 }[z.risk];
    return {
      state: z.s,
      district: z.d,
      riskLevel: z.risk,
      affectedHectares: Math.floor(sf(seed, 800, 12000) * riskMultiplier),
      affectedFarms: Math.floor(sf(seed + 1, 40, 480) * riskMultiplier),
      precipitationDeficit: parseFloat(sf(seed + 2, 10, 65).toFixed(1)),
      ndviAnomaly: parseFloat(sf(seed + 3, -0.18, -0.02).toFixed(3)),
      forecastHorizonDays: [7, 14, 30][Math.floor(sf(seed + 4, 0, 3)) % 3],
      alertIssued: z.risk === "critical" || z.risk === "high",
    };
  });
}

const CROPS: Array<{ crop: string; season: string; healthStatus: CropIntelligence["healthStatus"] }> = [
  { crop: "Wheat", season: "Rabi 2025-26", healthStatus: "excellent" },
  { crop: "Rice", season: "Kharif 2025", healthStatus: "good" },
  { crop: "Cotton", season: "Kharif 2025", healthStatus: "fair" },
  { crop: "Soybean", season: "Kharif 2025", healthStatus: "good" },
  { crop: "Sugarcane", season: "Annual 2025", healthStatus: "excellent" },
  { crop: "Maize", season: "Kharif 2025", healthStatus: "good" },
  { crop: "Groundnut", season: "Kharif 2025", healthStatus: "fair" },
  { crop: "Pulses", season: "Rabi 2025-26", healthStatus: "fair" },
];

export function getCropIntelligence(): CropIntelligence[] {
  return CROPS.map((c) => {
    const seed = seedHash(`${c.crop}-intel`);
    return {
      cropType: c.crop,
      totalHectares: Math.floor(sf(seed, 45000, 320000)),
      states: Math.floor(sf(seed + 1, 4, 12)),
      avgNDVI: parseFloat(sf(seed + 2, 0.42, 0.78).toFixed(3)),
      avgCarbonTha: parseFloat(sf(seed + 3, 1.8, 7.5).toFixed(2)),
      yieldIndexPct: parseFloat(sf(seed + 4, 72, 108).toFixed(1)),
      healthStatus: c.healthStatus,
      season: c.season,
    };
  });
}

export function getCrossStateIntelligenceSummary() {
  const ndvi = getCrossStateNDVITrends();
  const drought = getDroughtRiskAggregations();
  const crops = getCropIntelligence();
  return {
    statesMonitored: STATES.length,
    avgNationalNDVI: parseFloat((ndvi.filter((t) => t.season === "Kharif 2025").reduce((a, t) => a + t.ndviQ3, 0) / STATES.length).toFixed(3)),
    criticalDroughtZones: drought.filter((d) => d.riskLevel === "critical").length,
    highDroughtZones: drought.filter((d) => d.riskLevel === "high").length,
    totalCropsMonitored: crops.length,
    excellentCrops: crops.filter((c) => c.healthStatus === "excellent").length,
  };
}
