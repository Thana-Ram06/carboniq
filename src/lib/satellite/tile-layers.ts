/**
 * Satellite tile layer configurations for Leaflet
 * All free-tier layers — no API key required.
 */

export type LayerMode = "road" | "satellite" | "ndvi";

export interface TileLayerConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
  tms?: boolean;
}

export const TILE_LAYERS: Record<"road" | "satellite", TileLayerConfig> = {
  road: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: "abc",
  },
  satellite: {
    // ESRI World Imagery — real satellite photos, free, no API key
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles © Esri — Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, GIS Community",
    maxZoom: 18,
  },
};

export const LAYER_LABELS: Record<LayerMode, string> = {
  road:      "Road Map",
  satellite: "Satellite",
  ndvi:      "NDVI Mode",
};

// NDVI color stops for the legend (matches ndvi-engine.ts ndviToColor)
export const NDVI_LEGEND = [
  { label: "0.0", color: "#ef4444" },
  { label: "0.15", color: "#fbbf24" },
  { label: "0.35", color: "#86efac" },
  { label: "0.55", color: "#4ade80" },
  { label: "0.70+", color: "#16a34a" },
] as const;
