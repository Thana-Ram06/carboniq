import type { PilotPerformanceMetric } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const PILOTS = [
  { id: "PILOT-MH-01", name: "Maharashtra Kharif Pilot", state: "Maharashtra", dist: "Nashik", farms: 240, status: "healthy" as const },
  { id: "PILOT-PB-01", name: "Punjab Wheat Validation", state: "Punjab", dist: "Ludhiana", farms: 180, status: "healthy" as const },
  { id: "PILOT-GJ-01", name: "Gujarat Drought Monitoring", state: "Gujarat", dist: "Anand", farms: 120, status: "at_risk" as const },
  { id: "PILOT-MP-01", name: "MP Soybean Carbon Track", state: "Madhya Pradesh", dist: "Bhopal", farms: 160, status: "healthy" as const },
  { id: "PILOT-TG-01", name: "Telangana Rice Pilot", state: "Telangana", dist: "Warangal", farms: 95, status: "stalled" as const },
  { id: "PILOT-KA-01", name: "Karnataka Sugarcane MRV", state: "Karnataka", dist: "Mysuru", farms: 110, status: "healthy" as const },
];

export function getPilotPerformanceMetrics(): PilotPerformanceMetric[] {
  return PILOTS.map((p, i) => {
    const seed = seedHash(p.id);
    const activeRatio = p.status === "stalled" ? 0.55 : p.status === "at_risk" ? 0.78 : 0.92;
    return {
      pilotId: p.id,
      pilotName: p.name,
      state: p.state,
      district: p.dist,
      farmsEnrolled: p.farms,
      farmsActive: Math.floor(p.farms * (activeRatio + sf(seed, -0.05, 0.05))),
      ndviCoveragePercent: parseFloat(sf(seed + 1, p.status === "stalled" ? 58 : 82, 99).toFixed(1)),
      auditCompletionRate: parseFloat(sf(seed + 2, p.status === "stalled" ? 45 : 75, 98).toFixed(1)),
      reportingOnTimeRate: parseFloat(sf(seed + 3, p.status === "at_risk" ? 62 : 80, 99).toFixed(1)),
      avgDataQualityScore: parseFloat(sf(seed + 4, p.status === "stalled" ? 55 : 78, 97).toFixed(1)),
      carbonCreditsMinted: Math.floor(sf(seed + 5, p.farms * 0.5, p.farms * 3.5)),
      operationalUptimePct: parseFloat(sf(seed + 6, p.status === "stalled" ? 72 : 93, 99.9).toFixed(2)),
      startDate: new Date(2025, i, 1).toISOString().split("T")[0],
      reviewDate: new Date(2026, i + 2, 1).toISOString().split("T")[0],
      status: p.status,
    };
  });
}

export function getPilotSummary() {
  const metrics = getPilotPerformanceMetrics();
  return {
    totalPilots: metrics.length,
    healthyPilots: metrics.filter((p) => p.status === "healthy").length,
    atRiskPilots: metrics.filter((p) => p.status === "at_risk").length,
    stalledPilots: metrics.filter((p) => p.status === "stalled").length,
    totalFarmsEnrolled: metrics.reduce((a, p) => a + p.farmsEnrolled, 0),
    totalFarmsActive: metrics.reduce((a, p) => a + p.farmsActive, 0),
    totalCarbonCreditsMinted: metrics.reduce((a, p) => a + p.carbonCreditsMinted, 0),
    avgAuditCompletionRate: parseFloat((metrics.reduce((a, p) => a + p.auditCompletionRate, 0) / metrics.length).toFixed(1)),
  };
}
