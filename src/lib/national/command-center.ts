import type { StateAggregation, NationalDistrictReport, NationalCommandMetric } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const STATES: Array<{ state: string; region: StateAggregation["region"] }> = [
  { state: "Maharashtra", region: "west" },
  { state: "Punjab", region: "north" },
  { state: "Gujarat", region: "west" },
  { state: "Madhya Pradesh", region: "central" },
  { state: "Uttar Pradesh", region: "north" },
  { state: "Rajasthan", region: "north" },
  { state: "Karnataka", region: "south" },
  { state: "Tamil Nadu", region: "south" },
  { state: "Andhra Pradesh", region: "south" },
  { state: "Telangana", region: "south" },
  { state: "Odisha", region: "east" },
  { state: "West Bengal", region: "east" },
];

export function getStateAggregations(): StateAggregation[] {
  return STATES.map((s) => {
    const seed = seedHash(s.state);
    const totalFarms = Math.floor(sf(seed, 800, 4200));
    const activePct = sf(seed + 1, 0.72, 0.97);
    return {
      state: s.state,
      region: s.region,
      totalFarms,
      activeFarms: Math.floor(totalFarms * activePct),
      totalHectares: Math.floor(sf(seed + 2, 12000, 85000)),
      avgNDVI: parseFloat(sf(seed + 3, 0.38, 0.74).toFixed(3)),
      droughtRiskPct: parseFloat(sf(seed + 4, 4, 42).toFixed(1)),
      carbonTonnesTotal: Math.floor(sf(seed + 5, 8000, 62000)),
      verifiedFarmsPct: parseFloat(sf(seed + 6, 55, 96).toFixed(1)),
      operationalScore: parseFloat(sf(seed + 7, 72, 99).toFixed(1)),
      lastSyncAt: new Date(Date.now() - Math.floor(sf(seed + 8, 0, 3600000))).toISOString(),
      alertCount: Math.floor(sf(seed + 9, 0, 12)),
    };
  });
}

const DISTRICTS = [
  { d: "Nashik", s: "Maharashtra" }, { d: "Pune", s: "Maharashtra" }, { d: "Amravati", s: "Maharashtra" },
  { d: "Ludhiana", s: "Punjab" }, { d: "Amritsar", s: "Punjab" },
  { d: "Anand", s: "Gujarat" }, { d: "Surat", s: "Gujarat" },
  { d: "Bhopal", s: "Madhya Pradesh" }, { d: "Indore", s: "Madhya Pradesh" },
  { d: "Warangal", s: "Telangana" }, { d: "Mysuru", s: "Karnataka" }, { d: "Coimbatore", s: "Tamil Nadu" },
  { d: "Jaipur", s: "Rajasthan" }, { d: "Agra", s: "Uttar Pradesh" }, { d: "Varanasi", s: "Uttar Pradesh" },
];

const RISK_LEVELS: NationalDistrictReport["droughtRisk"][] = ["low", "medium", "high", "critical"];

export function getDistrictIntelligence(): NationalDistrictReport[] {
  return DISTRICTS.map((loc) => {
    const seed = seedHash(`${loc.d}-intel`);
    const ndvi = parseFloat(sf(seed, 0.32, 0.78).toFixed(3));
    const trendIdx = Math.floor(sf(seed + 1, 0, 3));
    const trends: NationalDistrictReport["ndviTrend"][] = ["up", "down", "stable"];
    return {
      district: loc.d,
      state: loc.s,
      farms: Math.floor(sf(seed + 2, 80, 650)),
      ndviAvg: ndvi,
      ndviTrend: trends[trendIdx % 3],
      carbonEstimate: parseFloat(sf(seed + 3, 800, 8400).toFixed(0)),
      droughtRisk: RISK_LEVELS[Math.floor(sf(seed + 4, 0, 4)) % 4],
      auditsPending: Math.floor(sf(seed + 5, 0, 24)),
      lastUpdated: new Date(Date.now() - Math.floor(sf(seed + 6, 0, 86400000))).toISOString(),
    };
  });
}

export function getNationalCommandMetrics(): NationalCommandMetric[] {
  const states = getStateAggregations();
  const totalFarms = states.reduce((a, s) => a + s.totalFarms, 0);
  const activeFarms = states.reduce((a, s) => a + s.activeFarms, 0);
  const totalCarbon = states.reduce((a, s) => a + s.carbonTonnesTotal, 0);
  const avgNDVI = parseFloat((states.reduce((a, s) => a + s.avgNDVI, 0) / states.length).toFixed(3));
  const alertCount = states.reduce((a, s) => a + s.alertCount, 0);
  const avgOpScore = parseFloat((states.reduce((a, s) => a + s.operationalScore, 0) / states.length).toFixed(1));

  return [
    { label: "Active Farms", value: activeFarms.toLocaleString(), unit: "farms", trend: 8.4, status: "healthy" },
    { label: "National NDVI", value: avgNDVI, unit: "index", trend: 3.2, status: "healthy" },
    { label: "Carbon Sequestered", value: (totalCarbon / 1000).toFixed(1), unit: "kt CO₂e", trend: 12.1, status: "healthy" },
    { label: "States Active", value: states.length, unit: "states", trend: 0, status: "healthy" },
    { label: "Total Farms", value: totalFarms.toLocaleString(), unit: "registered", trend: 15.3, status: "healthy" },
    { label: "Active Alerts", value: alertCount, unit: "alerts", trend: -22, status: alertCount > 30 ? "warning" : "healthy" },
    { label: "Ops Score", value: avgOpScore, unit: "%", trend: 2.1, status: avgOpScore < 80 ? "warning" : "healthy" },
    { label: "Verified Farms", value: `${parseFloat((states.reduce((a, s) => a + s.verifiedFarmsPct, 0) / states.length).toFixed(1))}`, unit: "% verified", trend: 5.6, status: "healthy" },
  ];
}

export function getNationalSummary() {
  const states = getStateAggregations();
  return {
    totalStates: states.length,
    totalFarms: states.reduce((a, s) => a + s.totalFarms, 0),
    activeFarms: states.reduce((a, s) => a + s.activeFarms, 0),
    totalHectares: states.reduce((a, s) => a + s.totalHectares, 0),
    carbonTonnesTotal: states.reduce((a, s) => a + s.carbonTonnesTotal, 0),
    avgNDVI: parseFloat((states.reduce((a, s) => a + s.avgNDVI, 0) / states.length).toFixed(3)),
    highAlertStates: states.filter((s) => s.alertCount > 5).length,
    avgOperationalScore: parseFloat((states.reduce((a, s) => a + s.operationalScore, 0) / states.length).toFixed(1)),
  };
}
