import type { ValidationDataset, ResearchDataset } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export function getValidationDatasets(): ValidationDataset[] {
  const datasets = [
    { id: "vds-001", name: "India Kharif NDVI 2025", desc: "Sentinel-2 NDVI paired with field measurements for Kharif 2025 across 9 states", count: 3420, seasons: ["Kharif 2025"], crops: ["Rice", "Cotton", "Soybean", "Maize"], ndvi: 3420, carbon: 1840, version: "v1.2", pub: true },
    { id: "vds-002", name: "Rabi Wheat Carbon Dataset", desc: "Ground-truth carbon samples from wheat fields in Punjab, Haryana, and MP", count: 2180, seasons: ["Rabi 2025-26"], crops: ["Wheat"], ndvi: 1200, carbon: 2180, version: "v1.0", pub: true },
    { id: "vds-003", name: "Multi-Season Validation Archive", desc: "Aggregated 3-year validation archive across all crop types and regions", count: 8640, seasons: ["Kharif 2023", "Rabi 2023-24", "Kharif 2024", "Rabi 2024-25", "Kharif 2025"], crops: ["Wheat", "Rice", "Cotton", "Soybean", "Sugarcane", "Maize", "Groundnut"], ndvi: 7800, carbon: 4200, version: "v3.0", pub: false },
    { id: "vds-004", name: "Drought Event Ground Truth", desc: "Farm-level observations during 2023 and 2024 drought events", count: 580, seasons: ["Kharif 2023", "Kharif 2024"], crops: ["Cotton", "Soybean", "Maize", "Groundnut"], ndvi: 580, carbon: 320, version: "v1.1", pub: true },
  ];
  const stateGroups = [["Maharashtra", "Punjab", "Gujarat"], ["Punjab", "Haryana", "MP"], ["Maharashtra", "Punjab", "Gujarat", "MP", "Telangana", "Karnataka", "TN", "AP", "Rajasthan"], ["Maharashtra", "Gujarat", "Rajasthan"]];
  return datasets.map((d, i) => ({
    id: d.id,
    name: d.name,
    description: d.desc,
    recordCount: d.count,
    states: stateGroups[i],
    seasons: d.seasons,
    cropTypes: d.crops,
    ndviObservations: d.ndvi,
    carbonObservations: d.carbon,
    createdAt: new Date(2025, i * 2, 15).toISOString(),
    version: d.version,
    isPublic: d.pub,
  }));
}

export function getResearchDatasets(): ResearchDataset[] {
  const datasets = [
    { id: "rd-001", title: "VASUDHA NDVI Timeseries v2025", type: "ndvi_timeseries" as const, count: 42000, spatial: "9 states, 68 districts", temporal: "Jan 2023 – Dec 2025", license: "CC-BY-4.0" as const, dls: 847, citations: 12, pub: true },
    { id: "rd-002", title: "Agricultural Carbon Samples India", type: "carbon_samples" as const, count: 8640, spatial: "12 states, 92 districts", temporal: "2023 – 2026", license: "CC-BY-4.0" as const, dls: 324, citations: 7, pub: true },
    { id: "rd-003", title: "Soil Organic Carbon Profiles", type: "soil_profiles" as const, count: 2400, spatial: "6 states, 38 districts", temporal: "2024 – 2025", license: "CC-BY-NC-4.0" as const, dls: 156, citations: 3, pub: true },
    { id: "rd-004", title: "Biomass Survey Dataset 2025", type: "biomass_survey" as const, count: 1820, spatial: "Maharashtra, Punjab, MP", temporal: "Kharif/Rabi 2025", license: "CC-BY-NC-4.0" as const, dls: 89, citations: 2, pub: true },
    { id: "rd-005", title: "Sentinel-2 Drone Validation Imagery", type: "drone_imagery" as const, count: 340, spatial: "Nashik, Ludhiana, Anand pilot zones", temporal: "Oct 2025 – Feb 2026", license: "proprietary" as const, dls: 0, citations: 0, pub: false },
  ];
  return datasets.map((d, i) => ({
    id: d.id,
    title: d.title,
    dataType: d.type,
    recordCount: d.count,
    spatialCoverage: d.spatial,
    temporalRange: d.temporal,
    license: d.license,
    downloadCount: d.dls,
    citationCount: d.citations,
    createdAt: new Date(2025, i, 10).toISOString(),
    isPublished: d.pub,
  }));
}

export function getDatasetSummary() {
  const vds = getValidationDatasets();
  const rds = getResearchDatasets();
  return {
    validationDatasets: vds.length,
    researchDatasets: rds.length,
    totalRecords: vds.reduce((a, d) => a + d.recordCount, 0) + rds.reduce((a, d) => a + d.recordCount, 0),
    publicDatasets: rds.filter((d) => d.isPublished).length,
    totalDownloads: rds.reduce((a, d) => a + d.downloadCount, 0),
    totalCitations: rds.reduce((a, d) => a + d.citationCount, 0),
  };
}
