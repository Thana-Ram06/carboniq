import type { StateMonitorSummary, DistrictMonitor } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const STATE_DATA: Record<string, { farms: number; area: number; crop: string; droughtBase: number }> = {
  "Punjab":         { farms: 284, area: 62400,  crop: "Wheat",      droughtBase: 1 },
  "Haryana":        { farms: 198, area: 44200,  crop: "Wheat",      droughtBase: 1 },
  "Uttar Pradesh":  { farms: 312, area: 74800,  crop: "Sugarcane",  droughtBase: 2 },
  "Madhya Pradesh": { farms: 224, area: 58600,  crop: "Soybean",    droughtBase: 2 },
  "Maharashtra":    { farms: 268, area: 66200,  crop: "Cotton",     droughtBase: 2 },
  "Gujarat":        { farms: 186, area: 41800,  crop: "Cotton",     droughtBase: 2 },
  "Karnataka":      { farms: 154, area: 38400,  crop: "Maize",      droughtBase: 3 },
  "Andhra Pradesh": { farms: 142, area: 34200,  crop: "Rice",       droughtBase: 2 },
  "Rajasthan":      { farms: 118, area: 32600,  crop: "Pulses",     droughtBase: 3 },
};

const DROUGHT_LEVELS: StateMonitorSummary["droughtRiskLevel"][] = ["low", "moderate", "high", "critical"];

export function getStateMonitorSummaries(): StateMonitorSummary[] {
  return Object.entries(STATE_DATA).map(([state, config]) => {
    const seed = seedHash(state);
    const activeFarms = Math.round(sf(seed, config.farms * 0.8, config.farms * 1.2));
    return {
      state,
      activeFarms,
      totalAreaHa: Math.round(sf(seed + 1, config.area * 0.9, config.area * 1.1)),
      avgCarbonScore: parseFloat(sf(seed + 2, 14, 38).toFixed(1)),
      avgNdviScore: parseFloat(sf(seed + 3, 0.42, 0.78).toFixed(3)),
      droughtRiskLevel: DROUGHT_LEVELS[Math.min(3, config.droughtBase + (seed % 2))],
      cropDiversity: Math.round(sf(seed + 4, 3, 9)),
      verifiedFarms: Math.round(activeFarms * sf(seed + 5, 0.55, 0.92)),
      alertCount: Math.round(sf(seed + 6, 0, 8)),
      lastScanDate: new Date(Date.now() - Math.round(sf(seed + 7, 0, 3)) * 86400000).toISOString().split("T")[0],
    };
  });
}

const DISTRICT_DATA: Array<{ district: string; state: string; crop: string }> = [
  { district: "Ludhiana",   state: "Punjab",       crop: "Wheat" },
  { district: "Karnal",     state: "Haryana",      crop: "Wheat" },
  { district: "Agra",       state: "Uttar Pradesh",crop: "Mustard" },
  { district: "Pune",       state: "Maharashtra",  crop: "Sugarcane" },
  { district: "Surat",      state: "Gujarat",      crop: "Cotton" },
  { district: "Indore",     state: "Madhya Pradesh",crop: "Soybean" },
  { district: "Mysuru",     state: "Karnataka",    crop: "Maize" },
  { district: "Kurnool",    state: "Andhra Pradesh",crop: "Rice" },
  { district: "Jodhpur",    state: "Rajasthan",    crop: "Bajra" },
  { district: "Amritsar",   state: "Punjab",       crop: "Rice" },
  { district: "Hisar",      state: "Haryana",      crop: "Cotton" },
  { district: "Nagpur",     state: "Maharashtra",  crop: "Orange" },
];

export function getDistrictMonitors(): DistrictMonitor[] {
  return DISTRICT_DATA.map((d) => {
    const seed = seedHash(`${d.district}-${d.state}`);
    return {
      district: d.district,
      state: d.state,
      farmCount: Math.round(sf(seed, 15, 120)),
      avgNdvi: parseFloat(sf(seed + 1, 0.38, 0.81).toFixed(3)),
      carbonTonnes: parseFloat(sf(seed + 2, 120, 2800).toFixed(0)),
      rainfallMm: parseFloat(sf(seed + 3, 42, 380).toFixed(0)),
      soilMoistureIndex: parseFloat(sf(seed + 4, 0.28, 0.74).toFixed(2)),
      riskScore: Math.round(sf(seed + 5, 12, 88)),
      dominantCrop: d.crop,
    };
  });
}

export function getNationalSnapshot() {
  const states = getStateMonitorSummaries();
  const districts = getDistrictMonitors();
  return {
    totalFarms: states.reduce((s, st) => s + st.activeFarms, 0),
    totalAreaHa: states.reduce((s, st) => s + st.totalAreaHa, 0),
    avgNdvi: parseFloat((states.reduce((s, st) => s + st.avgNdviScore, 0) / states.length).toFixed(3)),
    avgCarbon: parseFloat((states.reduce((s, st) => s + st.avgCarbonScore, 0) / states.length).toFixed(1)),
    statesMonitored: states.length,
    districtsMonitored: districts.length,
    highRiskStates: states.filter((s) => s.droughtRiskLevel === "high" || s.droughtRiskLevel === "critical").length,
    totalAlerts: states.reduce((s, st) => s + st.alertCount, 0),
  };
}
