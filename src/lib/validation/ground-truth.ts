import type {
  GroundTruthObservation,
  ValidationScore,
  ValidationScoreGrade,
  FieldVerificationMission,
} from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const DISTRICTS = ["Nashik", "Pune", "Amravati", "Aurangabad", "Latur", "Jalgaon", "Kolhapur", "Nagpur", "Solapur"];
const STATES = ["Maharashtra", "Madhya Pradesh", "Punjab", "Gujarat", "Rajasthan", "Karnataka", "Andhra Pradesh", "Telangana", "Tamil Nadu"];
const CROPS = ["Wheat", "Rice", "Cotton", "Soybean", "Sugarcane", "Maize", "Groundnut", "Pulses"];
const OBSERVERS = ["Dr. Anita Sharma", "Ravi Patil", "Sunita Devi", "Amit Kale", "Priya Menon", "Kiran Rao"];

export function getGroundTruthObservations(limit = 15): GroundTruthObservation[] {
  return Array.from({ length: limit }, (_, i) => {
    const seed = seedHash(`obs-${i}`);
    const ndviField = parseFloat(sf(seed, 0.30, 0.85).toFixed(3));
    const ndviSat = parseFloat((ndviField + sf(seed + 1, -0.05, 0.05)).toFixed(3));
    const carbonField = parseFloat(sf(seed + 2, 1.2, 8.5).toFixed(2));
    const carbonModel = parseFloat((carbonField * (1 + sf(seed + 3, -0.12, 0.12))).toFixed(2));
    return {
      id: `obs-${String(i + 1).padStart(4, "0")}`,
      farmId: `FARM-${String(seedHash(`fid-${i}`) % 9000 + 1000)}`,
      farmName: `${DISTRICTS[i % DISTRICTS.length]} Farm ${i + 1}`,
      district: DISTRICTS[i % DISTRICTS.length],
      state: STATES[i % STATES.length],
      observedAt: new Date(Date.now() - seedHash(`oat-${i}`) % (90 * 86400000)).toISOString(),
      observerName: OBSERVERS[i % OBSERVERS.length],
      ndviFieldMeasured: ndviField,
      ndviSatelliteEstimate: ndviSat,
      carbonFieldTonnes: carbonField,
      carbonModelledTonnes: carbonModel,
      soilSampleDepthCm: [15, 20, 30][i % 3],
      biomassWeightKg: parseFloat(sf(seed + 4, 120, 850).toFixed(1)),
      cropStage: ["vegetative", "flowering", "grain fill", "maturity"][i % 4],
      notes: i % 3 === 0 ? "Soil moisture higher than average due to recent irrigation" : "",
      photoUrls: [],
      validated: i % 5 !== 0,
    };
  });
}

export function computeValidationScore(farmId: string): ValidationScore {
  const seed = seedHash(farmId);
  const mae = parseFloat(sf(seed, 0.02, 0.08).toFixed(4));
  const rmse = parseFloat((mae * sf(seed + 1, 1.1, 1.4)).toFixed(4));
  const carbonMae = parseFloat(sf(seed + 2, 0.15, 0.9).toFixed(2));
  const carbonRmse = parseFloat((carbonMae * sf(seed + 3, 1.1, 1.5)).toFixed(2));
  const r2 = parseFloat(sf(seed + 4, 0.72, 0.98).toFixed(3));
  const bias = parseFloat(sf(seed + 5, -5, 5).toFixed(2));
  const count = Math.floor(sf(seed + 6, 8, 40));

  const GRADE_MAP: Record<string, ValidationScoreGrade> = { "0": "A", "1": "A", "2": "B", "3": "B", "4": "C", "5": "C", "6": "D", "7": "F" };
  const gradeIdx = mae < 0.03 ? "0" : mae < 0.04 ? "2" : mae < 0.05 ? "3" : mae < 0.06 ? "4" : mae < 0.07 ? "6" : "7";

  return {
    farmId,
    ndviMae: mae,
    ndviRmse: rmse,
    carbonMae,
    carbonRmse,
    correlationCoefficient: r2,
    biasPercent: bias,
    observationCount: count,
    grade: GRADE_MAP[gradeIdx] ?? "C",
    lastValidated: new Date(Date.now() - seed % (30 * 86400000)).toISOString(),
  };
}

export function getFieldVerificationMissions(): FieldVerificationMission[] {
  const missions = [
    { name: "Kharif 2025 Validation Drive", lead: "Dr. Anita Sharma", dist: "Nashik", state: "Maharashtra", target: 120, done: 98, start: "2025-09-01", end: "2025-10-31", gtCount: 312, anomalies: 7, status: "completed" as const },
    { name: "Rabi 2025–26 Ground Survey", lead: "Ravi Patil", dist: "Ludhiana", state: "Punjab", target: 80, done: 80, start: "2025-12-01", end: "2026-01-31", gtCount: 248, anomalies: 4, status: "completed" as const },
    { name: "Maharashtra Spot-Check Q1", lead: "Sunita Devi", dist: "Pune", state: "Maharashtra", target: 45, done: 37, start: "2026-02-15", end: "2026-03-31", gtCount: 112, anomalies: 2, status: "active" as const },
    { name: "Central India NDVI Calibration", lead: "Amit Kale", dist: "Bhopal", state: "Madhya Pradesh", target: 60, done: 0, start: "2026-06-01", end: "2026-07-31", gtCount: 0, anomalies: 0, status: "planned" as const },
    { name: "Gujarat Drought Validation", lead: "Priya Menon", dist: "Anand", state: "Gujarat", target: 55, done: 55, start: "2025-11-01", end: "2025-12-15", gtCount: 180, anomalies: 11, status: "completed" as const },
  ];
  return missions.map((m, i) => ({
    id: `mission-${String(i + 1).padStart(3, "0")}`,
    missionName: m.name,
    leadAuditor: m.lead,
    district: m.dist,
    state: m.state,
    targetFarms: m.target,
    completedFarms: m.done,
    startDate: m.start,
    endDate: m.end,
    status: m.status,
    groundTruthCount: m.gtCount,
    anomaliesFound: m.anomalies,
  }));
}

export function getValidationSummary() {
  const obs = getGroundTruthObservations(15);
  const missions = getFieldVerificationMissions();
  const totalObs = 852;
  const validatedObs = 741;
  return {
    totalObservations: totalObs,
    validatedObservations: validatedObs,
    validationRate: parseFloat(((validatedObs / totalObs) * 100).toFixed(1)),
    activeMissions: missions.filter((m) => m.status === "active").length,
    avgNDVIError: 0.0412,
    avgCarbonError: 0.38,
    recentObservations: obs.slice(0, 5),
  };
}
