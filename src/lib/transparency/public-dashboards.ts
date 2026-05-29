import type { StateAggregation } from "@/types";
import { getStateAggregations } from "@/lib/national/command-center";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export interface PublicEcosystemStat {
  label: string;
  value: string;
  description: string;
  isVerified: boolean;
}

export interface EnvironmentalIndicator {
  indicator: string;
  currentValue: number;
  unit: string;
  baselineValue: number;
  changePercent: number;
  trend: "improving" | "stable" | "declining";
  lastUpdated: string;
}

export function getPublicEcosystemStats(): PublicEcosystemStat[] {
  const states = getStateAggregations();
  const totalFarms = states.reduce((a, s) => a + s.totalFarms, 0);
  const totalCarbon = states.reduce((a, s) => a + s.carbonTonnesTotal, 0);
  const totalHectares = states.reduce((a, s) => a + s.totalHectares, 0);
  const avgNDVI = parseFloat((states.reduce((a, s) => a + s.avgNDVI, 0) / states.length).toFixed(3));

  return [
    { label: "Registered Farms", value: totalFarms.toLocaleString(), description: "Farms enrolled in VASUDHA national carbon monitoring network", isVerified: true },
    { label: "States Covered", value: String(states.length), description: "Indian states with active VASUDHA field operations and satellite monitoring", isVerified: true },
    { label: "Carbon Sequestered", value: `${(totalCarbon / 1000).toFixed(1)} kt CO₂e`, description: "Cumulative carbon sequestration verified under ISO 14064-3:2019", isVerified: true },
    { label: "Hectares Monitored", value: `${(totalHectares / 1000).toFixed(0)}K ha`, description: "Total agricultural land under NDVI and carbon monitoring coverage", isVerified: true },
    { label: "National Avg NDVI", value: String(avgNDVI), description: "Average vegetation health index across all monitored farms", isVerified: true },
    { label: "Verification Partners", value: "8", description: "Accredited third-party audit organisations in the VASUDHA network", isVerified: true },
  ];
}

export function getEnvironmentalIndicators(): EnvironmentalIndicator[] {
  const indicators = [
    { ind: "Average Farm NDVI", curr: 0.562, unit: "index", base: 0.498, trend: "improving" as const },
    { ind: "Carbon Density", curr: 3.42, unit: "t CO₂e/ha", base: 2.87, trend: "improving" as const },
    { ind: "Drought Coverage", curr: 18.4, unit: "% of monitored area", base: 22.1, trend: "improving" as const },
    { ind: "Crop Health Index", curr: 84.2, unit: "%", base: 77.6, trend: "improving" as const },
    { ind: "Verification Coverage", curr: 78.3, unit: "% farms verified", base: 52.0, trend: "improving" as const },
    { ind: "Soil Carbon Depth", curr: 0.31, unit: "m sampled", base: 0.21, trend: "stable" as const },
  ];
  return indicators.map((ind) => ({
    indicator: ind.ind,
    currentValue: ind.curr,
    unit: ind.unit,
    baselineValue: ind.base,
    changePercent: parseFloat(((ind.curr - ind.base) / ind.base * 100).toFixed(1)),
    trend: ind.trend,
    lastUpdated: new Date(Date.now() - 7 * 86400000).toISOString(),
  }));
}

export function getPublicStateSummaries(): Array<StateAggregation & { publicFarmUrl: string }> {
  return getStateAggregations().map((s) => ({
    ...s,
    publicFarmUrl: `/transparency/${s.state.toLowerCase().replace(/\s+/g, "-")}`,
  }));
}
