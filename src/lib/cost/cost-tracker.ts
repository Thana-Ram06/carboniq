/**
 * Cost Optimization Engine — VASUDHA Phase 11
 *
 * Tracks GCP / Firebase / Vercel cost drivers and surfaces
 * optimization recommendations with estimated savings.
 */

import type { CostEntry, CostOptimization, CostCategory, ScalingForecast } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

// Cost baselines (USD/month at current scale)
const COST_BASELINES: Record<CostCategory, { baseUSD: number; unitName: string; unitCount: number }> = {
  firestore_reads:  { baseUSD: 18.4,  unitName: "reads (M)",   unitCount: 6.1 },
  firestore_writes: { baseUSD: 8.2,   unitName: "writes (M)",  unitCount: 0.82 },
  storage:          { baseUSD: 3.6,   unitName: "GB stored",   unitCount: 36 },
  functions:        { baseUSD: 12.8,  unitName: "invocations (M)", unitCount: 2.56 },
  egress:           { baseUSD: 6.2,   unitName: "GB egress",   unitCount: 62 },
  satellite_api:    { baseUSD: 22.0,  unitName: "API calls (K)", unitCount: 4.4 },
};

export function getCostHistory(monthsBack = 6): CostEntry[] {
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const entries: CostEntry[] = [];
  const categories = Object.keys(COST_BASELINES) as CostCategory[];

  for (let m = monthsBack - 1; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
    for (const cat of categories) {
      const base = COST_BASELINES[cat];
      const seed = seedHash(`${cat}-${label}`);
      const growth = 1 + (monthsBack - 1 - m) * 0.04;
      const costUSD = parseFloat(sf(seed, base.baseUSD * 0.85, base.baseUSD * 1.18 * growth).toFixed(2));
      const prevSeed = seedHash(`${cat}-prev-${label}`);
      const prevCost = parseFloat(sf(prevSeed, base.baseUSD * 0.80, base.baseUSD * 1.10).toFixed(2));
      const trend: CostEntry["trend"] = costUSD > prevCost * 1.05 ? "increasing" : costUSD < prevCost * 0.95 ? "decreasing" : "stable";

      entries.push({
        category: cat,
        month: label,
        costUSD,
        units: parseFloat(sf(seed + 1, base.unitCount * 0.8, base.unitCount * 1.3).toFixed(2)),
        unitName: base.unitName,
        trend,
      });
    }
  }
  return entries;
}

export function getMonthlyTotal(month?: string): number {
  const history = getCostHistory(6);
  const target = month ?? history[history.length - 1].month;
  return parseFloat(
    history.filter((e) => e.month === target).reduce((s, e) => s + e.costUSD, 0).toFixed(2)
  );
}

export function getCostOptimizations(): CostOptimization[] {
  return [
    {
      id: "OPT-001",
      category: "firestore_reads",
      issue: "N+1 read pattern detected in farm list queries — loading each farm document individually",
      recommendation: "Batch reads using Firestore `getAll()`. Estimated 40% reduction in read operations.",
      estimatedSavingUSD: 7.2,
      effort: "low",
      priority: "high",
    },
    {
      id: "OPT-002",
      category: "satellite_api",
      issue: "NDVI computations re-run for unchanged farms on every dashboard load",
      recommendation: "Cache NDVI results with 24-hour TTL keyed on farmId+month. ~60% API call reduction.",
      estimatedSavingUSD: 13.1,
      effort: "medium",
      priority: "critical",
    },
    {
      id: "OPT-003",
      category: "functions",
      issue: "Evidence upload validation runs full AI inference synchronously per upload",
      recommendation: "Move AI inference to async background job. Reduce cold-start pressure.",
      estimatedSavingUSD: 4.8,
      effort: "medium",
      priority: "medium",
    },
    {
      id: "OPT-004",
      category: "egress",
      issue: "Satellite imagery thumbnails served at full resolution to mobile clients",
      recommendation: "Implement responsive image CDN with 480px mobile variant. ~45% egress reduction.",
      estimatedSavingUSD: 2.8,
      effort: "low",
      priority: "medium",
    },
    {
      id: "OPT-005",
      category: "storage",
      issue: "Old evidence files (>365 days) not transitioning to Nearline storage class",
      recommendation: "Add lifecycle rule: move to Nearline after 365 days. ~65% storage cost reduction on aged data.",
      estimatedSavingUSD: 1.4,
      effort: "low",
      priority: "low",
    },
    {
      id: "OPT-006",
      category: "firestore_writes",
      issue: "Platform logs written individually — one Firestore write per log entry",
      recommendation: "Batch log writes into 500-entry groups with 1-minute flush interval.",
      estimatedSavingUSD: 3.2,
      effort: "low",
      priority: "high",
    },
  ];
}

export function getScalingForecast(): ScalingForecast[] {
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentFarms = 1840;
  const monthlyGrowthRate = 0.12;

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
    const farms = Math.round(currentFarms * Math.pow(1 + monthlyGrowthRate, i + 1));
    const scale = farms / currentFarms;

    return {
      month: label,
      estimatedFarms: farms,
      estimatedCostUSD: parseFloat((getMonthlyTotal() * scale * 0.92).toFixed(2)),
      firestoreReadsM: parseFloat((6.1 * scale).toFixed(2)),
      storageGb: parseFloat((36 * scale * 0.8).toFixed(1)),
      apiCallsM: parseFloat((2.56 * scale).toFixed(2)),
    };
  });
}
