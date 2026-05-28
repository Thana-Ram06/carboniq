/**
 * ISRO Bhuvan Integration — VASUDHA Phase 10
 *
 * Interfaces with ISRO's Bhuvan geo-portal (bhuvan.nrsc.gov.in).
 * Provides LULC, soil, watershed, and NDVI district-level data.
 * Production: use Bhuvan WMS/WFS endpoints with proper auth.
 */

import type { BhuvanLayer, BhuvanNDVIData } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export const BHUVAN_LAYERS: BhuvanLayer[] = [
  {
    layerId: "BH_LULC_50K",
    name: "Land Use / Land Cover (1:50K)",
    category: "LULC",
    resolution: 56,
    lastUpdated: "2023-12-01",
    wmsEndpoint: "https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms",
    coverageStates: ["All India"],
  },
  {
    layerId: "BH_SOIL_250K",
    name: "Soil Resource Map (1:250K)",
    category: "Soil",
    resolution: 250,
    lastUpdated: "2022-06-15",
    wmsEndpoint: "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms",
    coverageStates: ["All India"],
  },
  {
    layerId: "BH_WATERSHED_50K",
    name: "Watershed Atlas (1:50K)",
    category: "Watershed",
    resolution: 56,
    lastUpdated: "2023-08-01",
    wmsEndpoint: "https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms",
    coverageStates: ["All India"],
  },
  {
    layerId: "BH_ADMIN_DIST",
    name: "Administrative Boundaries — District",
    category: "Administrative",
    resolution: 0,
    lastUpdated: "2024-01-15",
    wmsEndpoint: "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms",
    coverageStates: ["All India"],
  },
  {
    layerId: "BH_DEM_SRTM",
    name: "SRTM Digital Elevation Model (30m)",
    category: "Elevation",
    resolution: 30,
    lastUpdated: "2021-01-01",
    wmsEndpoint: "https://bhuvan-ras1.nrsc.gov.in/bhuvan/wms",
    coverageStates: ["All India"],
  },
  {
    layerId: "BH_CROP_SEA",
    name: "Seasonal Crop Mapping (56m)",
    category: "Crop",
    resolution: 56,
    lastUpdated: "2024-03-01",
    wmsEndpoint: "https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms",
    coverageStates: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Maharashtra"],
  },
];

const DISTRICT_NDVI_BASELINES: Record<string, number> = {
  "Amritsar":        0.72, "Ludhiana":       0.74, "Jalandhar":     0.71,
  "Rohtak":          0.66, "Karnal":          0.70, "Hisar":         0.60,
  "Agra":            0.58, "Lucknow":         0.56, "Varanasi":      0.55,
  "Indore":          0.56, "Bhopal":          0.54, "Jabalpur":      0.53,
  "Pune":            0.54, "Nagpur":          0.52, "Nashik":        0.55,
  "Ahmedabad":       0.48, "Surat":           0.52, "Rajkot":        0.46,
  "Mysuru":          0.58, "Bengaluru Rural": 0.52, "Dharwad":       0.54,
  "Visakhapatnam":   0.55, "Krishna":         0.60, "Guntur":        0.58,
  "Warangal":        0.54, "Hyderabad":       0.45, "Nizamabad":     0.56,
  "Patna":           0.57, "Muzaffarpur":     0.56, "Gaya":          0.52,
  "Kolkata":         0.50, "Murshidabad":     0.65, "Bardhaman":     0.62,
  "Chennai":         0.44, "Madurai":         0.52, "Salem":         0.55,
  "Jaipur":          0.42, "Jodhpur":         0.35, "Ajmer":         0.40,
  "Bhubaneswar":     0.60, "Cuttack":         0.62, "Puri":          0.58,
  "Raipur":          0.58, "Bilaspur":        0.56, "Korba":         0.54,
  "Thiruvananthapuram": 0.68, "Kochi":        0.72, "Kozhikode":     0.70,
};

export function getDistrictNDVI(state: string, month?: string): BhuvanNDVIData[] {
  const districtsByState: Record<string, string[]> = {
    "Punjab": ["Amritsar", "Ludhiana", "Jalandhar"],
    "Haryana": ["Rohtak", "Karnal", "Hisar"],
    "Uttar Pradesh": ["Agra", "Lucknow", "Varanasi"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur"],
    "Maharashtra": ["Pune", "Nagpur", "Nashik"],
    "Gujarat": ["Ahmedabad", "Surat", "Rajkot"],
    "Karnataka": ["Mysuru", "Bengaluru Rural", "Dharwad"],
    "Andhra Pradesh": ["Visakhapatnam", "Krishna", "Guntur"],
    "Telangana": ["Warangal", "Hyderabad", "Nizamabad"],
    "Bihar": ["Patna", "Muzaffarpur", "Gaya"],
    "West Bengal": ["Kolkata", "Murshidabad", "Bardhaman"],
    "Tamil Nadu": ["Chennai", "Madurai", "Salem"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Ajmer"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Puri"],
    "Chhattisgarh": ["Raipur", "Bilaspur", "Korba"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  };

  const districts = districtsByState[state] ?? ["District 1", "District 2"];
  const date = month ?? new Date().toISOString().split("T")[0].slice(0, 7) + "-15";

  return districts.map((dist) => {
    const base = DISTRICT_NDVI_BASELINES[dist] ?? 0.55;
    const seed = seedHash(`${dist}-${date}`);
    const meanNDVI = parseFloat(sf(seed, base * 0.90, base * 1.10).toFixed(4));
    const area = Math.round(sf(seed + 1, 1200, 8500));

    return {
      districtCode: dist.replace(/\s+/g, "_").toUpperCase().slice(0, 8),
      districtName: dist,
      state,
      date,
      meanNDVI,
      areaKmSq: area,
      vegetationCovPct: Math.round(meanNDVI * 100),
      anomalyFlag: meanNDVI < base * 0.85,
    };
  });
}

export function getLayersByCategory(category: BhuvanLayer["category"]): BhuvanLayer[] {
  return BHUVAN_LAYERS.filter((l) => l.category === category);
}
