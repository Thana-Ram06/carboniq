import type { RegionalCalibration } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const CALIBRATION_ZONES = [
  { state: "Maharashtra", district: "Nashik" },
  { state: "Maharashtra", district: "Pune" },
  { state: "Maharashtra", district: "Amravati" },
  { state: "Punjab", district: "Ludhiana" },
  { state: "Punjab", district: "Amritsar" },
  { state: "Gujarat", district: "Anand" },
  { state: "Gujarat", district: "Surat" },
  { state: "Madhya Pradesh", district: "Bhopal" },
  { state: "Madhya Pradesh", district: "Indore" },
  { state: "Telangana", district: "Warangal" },
  { state: "Karnataka", district: "Mysuru" },
  { state: "Tamil Nadu", district: "Coimbatore" },
];

export function getRegionalCalibrations(): RegionalCalibration[] {
  return CALIBRATION_ZONES.map((zone, i) => {
    const seed = seedHash(`${zone.state}-${zone.district}`);
    return {
      state: zone.state,
      district: zone.district,
      ndviBiasCorrection: parseFloat(sf(seed, -0.04, 0.04).toFixed(4)),
      carbonScaleFactor: parseFloat(sf(seed + 1, 0.92, 1.08).toFixed(4)),
      droughtThresholdAdjust: parseFloat(sf(seed + 2, -0.05, 0.05).toFixed(4)),
      sampleCount: Math.floor(sf(seed + 3, 30, 180)),
      r2Score: parseFloat(sf(seed + 4, 0.82, 0.97).toFixed(3)),
      calibratedAt: new Date(Date.now() - i * 10 * 86400000).toISOString(),
      approved: i % 5 !== 3,
    };
  });
}

export function getRegionalCalibrationByState(state: string): RegionalCalibration[] {
  return getRegionalCalibrations().filter((c) => c.state === state);
}

export function getCalibrationCoverage() {
  const cals = getRegionalCalibrations();
  const approved = cals.filter((c) => c.approved).length;
  const uniqueStates = [...new Set(cals.map((c) => c.state))].length;
  return {
    totalZones: cals.length,
    approvedZones: approved,
    pendingApproval: cals.length - approved,
    statesCovered: uniqueStates,
    avgR2: parseFloat((cals.reduce((a, c) => a + c.r2Score, 0) / cals.length).toFixed(3)),
  };
}
