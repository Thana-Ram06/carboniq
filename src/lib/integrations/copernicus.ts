/**
 * Copernicus / Sentinel Data Integration — VASUDHA Phase 10
 *
 * Interfaces with the Copernicus Data Space Ecosystem (CDSE).
 * Production: use CDSE OData API at catalogue.dataspace.copernicus.eu.
 * Sentinel-2 MSI for vegetation, Sentinel-1 SAR for soil/crop structure.
 */

import type { CopernicusScene, CopernicusProduct } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const PRODUCTS: CopernicusProduct[] = ["S2_MSI", "S1_SAR", "S3_OLCI", "S5P_TROPOMI"];
const PROCESSING_LEVELS = { S2_MSI: "L2A", S1_SAR: "L1", S3_OLCI: "L2B", S5P_TROPOMI: "L2B" } as const;

export interface CopernicusSearchRequest {
  state: string;
  startDate: string;
  endDate: string;
  product?: CopernicusProduct;
  maxCloudCover?: number;
  limit?: number;
}

export function searchScenes(req: CopernicusSearchRequest): CopernicusScene[] {
  const { state, startDate, endDate, product = "S2_MSI", maxCloudCover = 30, limit = 10 } = req;
  const scenes: CopernicusScene[] = [];
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const dayRange = (end - start) / 86400000;

  for (let i = 0; i < Math.min(limit, 12); i++) {
    const seed = seedHash(`${state}-${product}-${startDate}-${i}`);
    const cloudCover = parseFloat(sf(seed, 0, maxCloudCover + 5).toFixed(1));
    if (cloudCover > maxCloudCover) continue;

    const acqOffset = sf(seed + 1, 0, dayRange) * 86400000;
    const acqDate = new Date(start + acqOffset).toISOString().split("T")[0];
    const orbit = Math.round(sf(seed + 2, 1, 145));
    const sizeGb = parseFloat(sf(seed + 4, 0.8, 4.2).toFixed(2));
    const status = i < 3 ? "processed" : i < 6 ? "available" : "archived";

    scenes.push({
      productId: `${product}_${state.replace(" ", "")}_${acqDate}_${orbit.toString().padStart(6, "0")}`,
      product,
      acquisitionDate: acqDate,
      orbitNumber: orbit,
      processingLevel: PROCESSING_LEVELS[product],
      cloudCoverPct: cloudCover,
      sizeGb,
      status: status as CopernicusScene["status"],
    });
  }
  return scenes.sort((a, b) => b.acquisitionDate.localeCompare(a.acquisitionDate));
}

export interface DataSourceSummary {
  name: string;
  product: CopernicusProduct;
  lastScene: string;
  scenesAvailable: number;
  avgCloudCoverPct: number;
  coverageCompletePct: number;
  status: "nominal" | "delayed" | "outage";
}

export function getDataSourceSummaries(state: string): DataSourceSummary[] {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);
  const startStr = sixtyDaysAgo.toISOString().split("T")[0];
  const endStr = now.toISOString().split("T")[0];

  return PRODUCTS.map((product) => {
    const scenes = searchScenes({ state, startDate: startStr, endDate: endStr, product, limit: 12 });
    const avgCloud = scenes.length
      ? scenes.reduce((s, sc) => s + sc.cloudCoverPct, 0) / scenes.length
      : 0;
    const seed = seedHash(`${state}-${product}-summary`);
    const coverage = Math.round(sf(seed, 78, 98));

    const LABELS: Record<CopernicusProduct, string> = {
      S2_MSI: "Sentinel-2 MSI (Vegetation)",
      S1_SAR: "Sentinel-1 SAR (Structure)",
      S3_OLCI: "Sentinel-3 OLCI (Ocean/Land)",
      S5P_TROPOMI: "Sentinel-5P TROPOMI (Atm.)",
    };

    return {
      name: LABELS[product],
      product,
      lastScene: scenes[0]?.acquisitionDate ?? startStr,
      scenesAvailable: scenes.length,
      avgCloudCoverPct: parseFloat(avgCloud.toFixed(1)),
      coverageCompletePct: coverage,
      status: scenes.length >= 4 ? "nominal" : scenes.length >= 2 ? "delayed" : "outage",
    };
  });
}
