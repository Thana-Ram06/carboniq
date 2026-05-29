import type { RegionalConfidence, ValidationDensity, DataReliabilityScore, ValidationScoreGrade } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const GRADE_MAP: Record<string, ValidationScoreGrade> = {
  "0": "A", "1": "B", "2": "C", "3": "D", "4": "F",
};
function scoreToGrade(score: number): ValidationScoreGrade {
  if (score >= 90) return GRADE_MAP["0"];
  if (score >= 80) return GRADE_MAP["1"];
  if (score >= 70) return GRADE_MAP["2"];
  if (score >= 60) return GRADE_MAP["3"];
  return GRADE_MAP["4"];
}

const STATES = ["Maharashtra", "Punjab", "Gujarat", "Madhya Pradesh", "Uttar Pradesh", "Karnataka", "Tamil Nadu", "Telangana", "Rajasthan", "Odisha", "West Bengal", "Andhra Pradesh"];

export function getRegionalConfidences(): RegionalConfidence[] {
  return STATES.map((state) => {
    const seed = seedHash(`${state}-conf`);
    const ndvi = parseFloat(sf(seed, 78, 97).toFixed(1));
    const carbon = parseFloat(sf(seed + 1, 74, 95).toFixed(1));
    const drought = parseFloat(sf(seed + 2, 72, 94).toFixed(1));
    const overall = parseFloat(((ndvi + carbon + drought) / 3).toFixed(1));
    return {
      state,
      ndviConfidence: ndvi,
      carbonConfidence: carbon,
      droughtConfidence: drought,
      overallConfidence: overall,
      sampleDensityPerHectare: parseFloat(sf(seed + 3, 0.005, 0.042).toFixed(4)),
      lastCalibrationDaysAgo: Math.floor(sf(seed + 4, 1, 90)),
      reliabilityGrade: scoreToGrade(overall),
    };
  });
}

const DENSITY_DISTRICTS = [
  { d: "Nashik", s: "Maharashtra", farms: 420 }, { d: "Pune", s: "Maharashtra", farms: 380 },
  { d: "Ludhiana", s: "Punjab", farms: 320 }, { d: "Amritsar", s: "Punjab", farms: 280 },
  { d: "Anand", s: "Gujarat", farms: 210 }, { d: "Surat", s: "Gujarat", farms: 185 },
  { d: "Bhopal", s: "Madhya Pradesh", farms: 290 }, { d: "Indore", s: "Madhya Pradesh", farms: 260 },
  { d: "Warangal", s: "Telangana", farms: 195 }, { d: "Mysuru", s: "Karnataka", farms: 215 },
  { d: "Coimbatore", s: "Tamil Nadu", farms: 240 }, { d: "Jaipur", s: "Rajasthan", farms: 170 },
];

export function getValidationDensities(): ValidationDensity[] {
  return DENSITY_DISTRICTS.map((loc) => {
    const seed = seedHash(`${loc.d}-density`);
    const obsPerFarm = parseFloat(sf(seed, 3.2, 12.8).toFixed(1));
    const totalObs = Math.floor(loc.farms * obsPerFarm);
    const coverage = parseFloat(sf(seed + 1, 55, 98).toFixed(1));
    return {
      district: loc.d,
      state: loc.s,
      farmCount: loc.farms,
      observationCount: totalObs,
      observationsPerFarm: obsPerFarm,
      coveragePct: coverage,
      densityScore: parseFloat(((obsPerFarm / 12.8 * 0.6 + coverage / 100 * 0.4) * 100).toFixed(1)),
    };
  });
}

const REGIONS = ["North India", "South India", "West India", "Central India", "East India", "Northeast India"];

export function getDataReliabilityScores(): DataReliabilityScore[] {
  return REGIONS.map((region) => {
    const seed = seedHash(region);
    const freshness = parseFloat(sf(seed, 78, 99).toFixed(1));
    const valCov = parseFloat(sf(seed + 1, 65, 96).toFixed(1));
    const calCurr = parseFloat(sf(seed + 2, 72, 98).toFixed(1));
    const opsCons = parseFloat(sf(seed + 3, 80, 99).toFixed(1));
    const overall = parseFloat(((freshness + valCov + calCurr + opsCons) / 4).toFixed(1));
    return {
      region,
      overallScore: overall,
      dataFreshnessPct: freshness,
      validationCoveragePct: valCov,
      calibrationCurrencyPct: calCurr,
      operationalConsistencyPct: opsCons,
      lastAssessed: new Date(Date.now() - Math.floor(sf(seed + 4, 0, 7 * 86400000))).toISOString(),
    };
  });
}

export function getReliabilitySummary() {
  const conf = getRegionalConfidences();
  const scores = getDataReliabilityScores();
  const gradeCount: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  conf.forEach((c) => { gradeCount[c.reliabilityGrade] = (gradeCount[c.reliabilityGrade] ?? 0) + 1; });
  return {
    statesAssessed: conf.length,
    avgOverallConfidence: parseFloat((conf.reduce((a, c) => a + c.overallConfidence, 0) / conf.length).toFixed(1)),
    gradeDistribution: gradeCount,
    avgReliabilityScore: parseFloat((scores.reduce((a, s) => a + s.overallScore, 0) / scores.length).toFixed(1)),
    lowestRegion: scores.reduce((a, s) => (s.overallScore < a.overallScore ? s : a)).region,
  };
}
