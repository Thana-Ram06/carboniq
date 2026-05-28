import type { PartnerAdoptionMetric, EcosystemHealth, PartnerType } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const PARTNER_METRICS_DATA: Array<{
  org: string; type: PartnerType; state: string; joined: number;
}> = [
  { org: "Krishi Vikas Foundation",    type: "ngo",        state: "Punjab",       joined: 14 },
  { org: "Rajasthan Agri Cooperative", type: "cooperative",state: "Rajasthan",    joined: 8 },
  { org: "Karnataka State FPO",        type: "government", state: "Karnataka",    joined: 18 },
  { org: "TechFarm Solutions",         type: "enterprise", state: "Maharashtra",  joined: 6 },
  { org: "ICAR Research Station",      type: "research",   state: "UP",           joined: 22 },
  { org: "Haryana Green Carbon",       type: "ngo",        state: "Haryana",      joined: 11 },
  { org: "Gujarat Farmer Alliance",    type: "cooperative",state: "Gujarat",      joined: 4 },
  { org: "MP Agri Dept",               type: "government", state: "Madhya Pradesh", joined: 16 },
];

export function getPartnerAdoptionMetrics(): PartnerAdoptionMetric[] {
  return PARTNER_METRICS_DATA.map((p) => {
    const seed = seedHash(p.org);
    const farms = Math.round(sf(seed, 28, 420));
    const scans = Math.round(sf(seed + 1, farms * 6, farms * 18));
    const reportingRate = parseFloat(sf(seed + 2, 62, 98).toFixed(1));
    const adoptionScore = Math.round(sf(seed + 3, 52, 96));
    return {
      orgName: p.org,
      partnerType: p.type,
      state: p.state,
      farmsOnboarded: farms,
      monthlyScans: scans,
      reportingRate,
      adoptionScore,
      joinedMonthsAgo: p.joined,
    };
  });
}

export function getEcosystemHealth(): EcosystemHealth {
  const metrics = getPartnerAdoptionMetrics();
  const totalFarms = metrics.reduce((s, m) => s + m.farmsOnboarded, 0);
  const avgAdoption = metrics.reduce((s, m) => s + m.adoptionScore, 0) / metrics.length;
  const activePartners = metrics.filter((m) => m.adoptionScore >= 60).length;

  return {
    totalPartners: metrics.length,
    activePartners,
    totalFarmsRegistered: totalFarms,
    monthlyActiveOrgs: activePartners,
    avgOnboardingDays: parseFloat(sf(seedHash("eco"), 8, 24).toFixed(1)),
    reportSubmissionRate: parseFloat((metrics.reduce((s, m) => s + m.reportingRate, 0) / metrics.length).toFixed(1)),
    verificationCoverageRate: parseFloat(sf(seedHash("verify"), 68, 88).toFixed(1)),
    ecosystemScore: Math.round(avgAdoption),
  };
}

export function getAdoptionTrend(): Array<{ month: string; partners: number; farms: number; scans: number }> {
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
    const seed = seedHash(label);
    const growthFactor = 1 + i * 0.12;
    return {
      month: label,
      partners: Math.round(sf(seed, 3, 6) * growthFactor),
      farms: Math.round(sf(seed + 1, 180, 320) * growthFactor),
      scans: Math.round(sf(seed + 2, 1200, 2400) * growthFactor),
    };
  });
}
