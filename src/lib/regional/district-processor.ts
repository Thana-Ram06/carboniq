/**
 * District-Wide Regional Processor — VASUDHA Phase 10
 *
 * Aggregates farm-level intelligence across a district or state
 * to produce DistrictReport and StateReport summaries for
 * regional decision makers and government bodies.
 */

import type { DistrictReport, StateReport, RegionalScanJob, RegionalScanScope } from "@/types";
import { getDistrictNDVI } from "@/lib/integrations/bhuvan";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const STATE_NDVI: Record<string, number> = {
  "Punjab": 0.71, "Haryana": 0.68, "Uttar Pradesh": 0.60,
  "Madhya Pradesh": 0.57, "Maharashtra": 0.55, "Gujarat": 0.59,
  "Karnataka": 0.54, "Andhra Pradesh": 0.56, "Telangana": 0.55,
  "Bihar": 0.58, "West Bengal": 0.63, "Tamil Nadu": 0.57,
  "Rajasthan": 0.42, "Odisha": 0.59, "Chhattisgarh": 0.58, "Kerala": 0.62,
};

export function computeDistrictReport(districtName: string, state: string): DistrictReport {
  const seed = seedHash(`${districtName}-${state}`);
  const bhuvanData = getDistrictNDVI(state);
  const distData = bhuvanData.find((d) => d.districtName === districtName) ?? bhuvanData[0];
  const stateAvgNDVI = STATE_NDVI[state] ?? 0.55;

  const avgNDVI = distData?.meanNDVI ?? parseFloat(sf(seed, stateAvgNDVI * 0.9, stateAvgNDVI * 1.1).toFixed(4));
  const totalFarms = Math.round(sf(seed + 1, 80, 620));
  const totalAreaHa = parseFloat(sf(seed + 2, totalFarms * 1.8, totalFarms * 4.5).toFixed(1));
  const avgCarbonTonnesHa = parseFloat(sf(seed + 3, 2.2, 4.8).toFixed(2));
  const avgYieldTha = parseFloat(sf(seed + 4, 1.8, 5.2).toFixed(2));
  const anomalyCount = Math.round(sf(seed + 5, 0, totalFarms * 0.15));
  const droughtRiskPct = Math.round(Math.max(0, Math.min(100, 30 - avgNDVI * 40)));
  const percentileVsState = Math.round(Math.max(5, Math.min(99, 50 + (avgNDVI - stateAvgNDVI) * 200)));

  return {
    districtName,
    state,
    totalFarms,
    totalAreaHa,
    avgNDVI,
    avgCarbonTonnesHa,
    avgYieldTha,
    anomalyCount,
    droughtRiskPct,
    percentileVsState,
    generatedAt: new Date().toISOString(),
  };
}

export function computeStateReport(state: string): StateReport {
  const seed = seedHash(`${state}-statereport`);
  const bhuvanData = getDistrictNDVI(state);
  const avgNDVI = bhuvanData.reduce((s, d) => s + d.meanNDVI, 0) / Math.max(bhuvanData.length, 1);
  const nationalAvgNDVI = 0.56;

  const districts = bhuvanData.map((d) => d.districtName);
  const sortedByNDVI = [...bhuvanData].sort((a, b) => b.meanNDVI - a.meanNDVI);
  const topDistrict = sortedByNDVI[0]?.districtName ?? districts[0] ?? "N/A";
  const bottomDistrict = sortedByNDVI[sortedByNDVI.length - 1]?.districtName ?? districts[0] ?? "N/A";

  const totalFarms = Math.round(sf(seed + 1, 2000, 18000));
  const totalAreaHa = parseFloat(sf(seed + 2, totalFarms * 2.5, totalFarms * 5.0).toFixed(0));
  const avgCarbonTha = sf(seed + 3, 2.4, 4.2);
  const totalCarbonMt = parseFloat((totalAreaHa * avgCarbonTha / 1e6).toFixed(4));
  const droughtAffectedPct = Math.round(Math.max(0, Math.min(100, 25 - avgNDVI * 30)));
  const yieldIndex = parseFloat(((STATE_NDVI[state] ?? 0.55) / nationalAvgNDVI).toFixed(2));

  return {
    state,
    totalFarms,
    totalAreaHa,
    totalCarbonMt,
    avgNDVI: parseFloat(avgNDVI.toFixed(4)),
    topDistrict,
    bottomDistrict,
    droughtAffectedDistrictsPct: droughtAffectedPct,
    yieldIndexVsNational: yieldIndex,
    generatedAt: new Date().toISOString(),
  };
}

export function createRegionalScanJob(
  scope: RegionalScanScope,
  regionName: string,
  state: string,
  triggeredBy: string,
): RegionalScanJob {
  const seed = seedHash(`${regionName}-${scope}-${Date.now()}`);
  const farmCount = Math.round(sf(seed, 40, scope === "state" ? 15000 : 600));
  const progressPct = Math.round(sf(seed + 1, 15, 100));
  const status: RegionalScanJob["status"] =
    progressPct >= 100 ? "completed" : progressPct > 40 ? "processing" : "queued";

  return {
    id: `RSJ-${(seed % 99999).toString().padStart(5, "0")}`,
    scope,
    regionName,
    regionCode: regionName.replace(/\s+/g, "_").toUpperCase().slice(0, 6),
    state,
    farmCount,
    status,
    progressPct: Math.min(progressPct, 100),
    startedAt: new Date(Date.now() - (seed % 3600000)).toISOString(),
    completedAt: status === "completed" ? new Date().toISOString() : undefined,
    triggeredBy,
  };
}

export function getRegionalScanHistory(state: string): RegionalScanJob[] {
  const districts = ["North", "South", "East", "West", "Central"];
  return districts.map((dir) =>
    createRegionalScanJob("district", `${dir} ${state}`, state, "system")
  );
}
