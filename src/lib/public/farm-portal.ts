import type { PublicFarmReport, SustainabilityTier } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const CROP_TYPES = ["Wheat", "Rice", "Cotton", "Sugarcane", "Soybean", "Maize", "Pulses", "Vegetables"];
const STATES = ["Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Gujarat", "Madhya Pradesh", "Karnataka", "Rajasthan"];
const DISTRICTS: Record<string, string[]> = {
  "Punjab": ["Ludhiana", "Amritsar", "Patiala"],
  "Haryana": ["Karnal", "Hisar", "Rohtak"],
  "Uttar Pradesh": ["Agra", "Lucknow", "Varanasi"],
  "Maharashtra": ["Pune", "Nagpur", "Nashik"],
  "Gujarat": ["Surat", "Rajkot", "Vadodara"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
  "Karnataka": ["Mysuru", "Dharwad", "Belagavi"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota"],
};

const FARMER_NAMES = [
  "Rajesh Kumar", "Priya Sharma", "Suresh Patel", "Anita Verma",
  "Mohan Singh", "Kavita Yadav", "Amit Tiwari", "Sunita Devi",
];

const ALL_BADGES = [
  "Carbon Verified", "NDVI Champion", "Water Efficient", "Organic Certified",
  "Climate Resilient", "High Yield", "Low Emission", "Biodiversity Positive",
];

function getTier(carbonScore: number): SustainabilityTier {
  if (carbonScore >= 35) return "platinum";
  if (carbonScore >= 25) return "gold";
  if (carbonScore >= 15) return "silver";
  return "bronze";
}

export function getPublicFarmReport(farmId: string): PublicFarmReport {
  const seed = seedHash(farmId);
  const state = STATES[seed % STATES.length];
  const districts = DISTRICTS[state] ?? ["Central"];
  const district = districts[(seed + 1) % districts.length];
  const carbonScore = parseFloat(sf(seed, 8, 48).toFixed(1));
  const ndvi = parseFloat(sf(seed + 1, 0.38, 0.82).toFixed(3));
  const ndviTrendIdx = seed % 3;
  const ndviTrend: PublicFarmReport["ndviTrend"] = ndviTrendIdx === 0 ? "improving" : ndviTrendIdx === 1 ? "stable" : "declining";
  const verified = seed % 5 !== 0;

  const badgeCount = 2 + (seed % 3);
  const badges = ALL_BADGES.slice(seed % 4, (seed % 4) + badgeCount);

  return {
    farmId,
    farmName: `${FARMER_NAMES[seed % FARMER_NAMES.length].split(" ")[0]} Agri Farm`,
    ownerName: FARMER_NAMES[seed % FARMER_NAMES.length],
    state,
    district,
    areaHectares: parseFloat(sf(seed + 2, 1.2, 24.8).toFixed(1)),
    cropType: CROP_TYPES[seed % CROP_TYPES.length],
    sustainabilityTier: getTier(carbonScore),
    carbonScoreTonnes: carbonScore,
    ndviScore: ndvi,
    ndviTrend,
    verificationStatus: verified ? "verified" : "pending",
    verifiedBy: verified ? "VASUDHA Audit Team" : undefined,
    lastUpdated: new Date(Date.now() - Math.round(sf(seed + 3, 1, 30)) * 86400000).toISOString(),
    reportUrl: `/farm/${farmId}`,
    badges,
    carbonCredits: Math.round(carbonScore * 0.85),
    confidenceLevel: Math.round(sf(seed + 4, 72, 97)),
  };
}

export function getSamplePublicFarms(count = 8): PublicFarmReport[] {
  return Array.from({ length: count }, (_, i) => getPublicFarmReport(`farm-pub-${i.toString().padStart(4, "0")}`));
}

export function getTierConfig(tier: SustainabilityTier): { color: string; bg: string; border: string; label: string } {
  const configs = {
    platinum: { color: "text-cyan-300",   bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   label: "Platinum" },
    gold:     { color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "Gold" },
    silver:   { color: "text-slate-300",  bg: "bg-slate-500/10",  border: "border-slate-500/30",  label: "Silver" },
    bronze:   { color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/30", label: "Bronze" },
  };
  return configs[tier];
}
