"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, ZoomIn, ZoomOut, Maximize2, Satellite, Map } from "lucide-react";
import { ndviToColor, ndviBorder } from "@/lib/satellite/ndvi-engine";
import { TILE_LAYERS, NDVI_LEGEND, type LayerMode } from "@/lib/satellite/tile-layers";
import type { Farm } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LMap = any;

interface SatelliteMapProps {
  farms: Farm[];
  ndviScores: Record<string, number>; // farmId → NDVI value
  selectedFarmId?: string | null;
  layerMode: LayerMode;
  height?: string;
  onFarmSelect?: (farmId: string) => void;
}

export function SatelliteMap({
  farms,
  ndviScores,
  selectedFarmId,
  layerMode,
  height = "440px",
  onFarmSelect,
}: SatelliteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LMap | null>(null);
  const roadLayerRef = useRef<LMap | null>(null);
  const satLayerRef  = useRef<LMap | null>(null);
  // farmId → { polygon, circle }
  const farmLayersRef = useRef<Record<string, { polygon: LMap; circle: LMap }>>({});
  const [ready, setReady] = useState(false);

  // ── Initialise map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      // Centre on India
      const map = L.map(containerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
      });

      // Both tile layers created, only one active at a time
      const roadLayer = L.tileLayer(TILE_LAYERS.road.url, {
        attribution: TILE_LAYERS.road.attribution,
        maxZoom:     TILE_LAYERS.road.maxZoom,
        subdomains:  TILE_LAYERS.road.subdomains as string,
      });

      const satLayer = L.tileLayer(TILE_LAYERS.satellite.url, {
        attribution: TILE_LAYERS.satellite.attribution,
        maxZoom:     TILE_LAYERS.satellite.maxZoom,
      });

      // Start with satellite
      satLayer.addTo(map);
      roadLayerRef.current = roadLayer;
      satLayerRef.current  = satLayer;

      // Draw farm polygons
      farms.forEach((farm) => {
        if (!farm.boundary?.coordinates?.[0]?.length) return;
        const ndvi = ndviScores[farm.id] ?? 0.5;
        const ring = farm.boundary.coordinates[0];
        const latlngs = ring.map((c) => [c[1], c[0]] as [number, number]);

        const poly = L.polygon(latlngs, {
          color:       ndviBorder(ndvi),
          fillColor:   ndviToColor(ndvi, 0.18),
          fillOpacity: 1,
          weight: 2,
          opacity: 0.8,
        });

        // Centroid
        const clat = latlngs.reduce((s, c) => s + c[0], 0) / latlngs.length;
        const clng = latlngs.reduce((s, c) => s + c[1], 0) / latlngs.length;

        const circle = L.circleMarker([clat, clng], {
          radius: 5,
          color: ndviBorder(ndvi),
          fillColor: ndviBorder(ndvi),
          fillOpacity: 0.9,
          weight: 1.5,
        });

        const popup = buildPopup(farm, ndvi);
        poly.bindPopup(popup);
        circle.bindPopup(popup);

        poly.on("click", () => onFarmSelect?.(farm.id));
        circle.on("click", () => onFarmSelect?.(farm.id));

        poly.addTo(map);
        circle.addTo(map);

        farmLayersRef.current[farm.id] = { polygon: poly, circle };
      });

      // Fit bounds if farms present
      const allBounds: Array<[number, number]> = [];
      farms.forEach((farm) => {
        if (farm.boundary?.coordinates?.[0]) {
          farm.boundary.coordinates[0].forEach((c) => {
            allBounds.push([c[1], c[0]]);
          });
        } else if (farm.coordinates) {
          allBounds.push([farm.coordinates.lat, farm.coordinates.lng]);
        }
      });

      if (allBounds.length > 0) {
        map.fitBounds(L.latLngBounds(allBounds), { padding: [40, 40] });
      }

      mapRef.current = map;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      farmLayersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Layer mode switch ─────────────────────────────────────────────────────
  useEffect(() => {
    const map  = mapRef.current;
    const road = roadLayerRef.current;
    const sat  = satLayerRef.current;
    if (!map || !road || !sat) return;

    if (layerMode === "road") {
      if (map.hasLayer(sat)) map.removeLayer(sat);
      if (!map.hasLayer(road)) road.addTo(map);
    } else {
      // satellite or ndvi — use satellite base
      if (map.hasLayer(road)) map.removeLayer(road);
      if (!map.hasLayer(sat)) sat.addTo(map);
    }

    // Update polygon fill based on mode
    Object.entries(farmLayersRef.current).forEach(([farmId, { polygon, circle }]) => {
      const ndvi = ndviScores[farmId] ?? 0.5;
      if (layerMode === "ndvi") {
        polygon.setStyle({
          fillColor:   ndviToColor(ndvi, 0.55),
          fillOpacity: 1,
          color:       ndviBorder(ndvi),
          weight: 2.5,
        });
        circle.setStyle({ color: ndviBorder(ndvi), fillColor: ndviBorder(ndvi) });
      } else {
        polygon.setStyle({
          fillColor:   "#4ade80",
          fillOpacity: 0.12,
          color:       "#4ade80",
          weight: 2,
          opacity: 0.7,
        });
        circle.setStyle({ color: "#4ade80", fillColor: "#22c55e" });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerMode, ready]);

  // ── Selected farm → pan to polygon ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedFarmId || !ready) return;

    const entry = farmLayersRef.current[selectedFarmId];
    if (entry) {
      try {
        map.fitBounds(entry.polygon.getBounds(), { padding: [32, 32] });
        entry.polygon.openPopup();
      } catch {
        // polygon may have no bounds if not yet rendered
      }
    } else {
      // Fall back to coordinate marker
      const farm = farms.find((f) => f.id === selectedFarmId);
      if (farm?.coordinates) {
        map.setView([farm.coordinates.lat, farm.coordinates.lng], 13);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFarmId, ready]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Zoom controls */}
      {ready && (
        <div className="absolute top-3 right-3 z-[999] flex flex-col gap-1.5">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              const allBounds: Array<[number, number]> = [];
              farms.forEach((farm) => {
                if (farm.boundary?.coordinates?.[0]) {
                  farm.boundary.coordinates[0].forEach((c) => allBounds.push([c[1], c[0]]));
                } else if (farm.coordinates) {
                  allBounds.push([farm.coordinates.lat, farm.coordinates.lng]);
                }
              });
              if (allBounds.length > 0 && mapRef.current) {
                const L = { latLngBounds: (pts: [number,number][]) => ({ isValid: () => true, _southWest: pts[0], _northEast: pts[pts.length-1] }) };
                void L;
                import("leaflet").then(({ default: LL }) => {
                  mapRef.current?.fitBounds(LL.latLngBounds(allBounds), { padding: [40, 40] });
                });
              }
            }}
            className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
            title="Fit all farms"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* NDVI Legend */}
      {layerMode === "ndvi" && (
        <div className="absolute bottom-3 left-3 z-[999]">
          <div className="bg-[#080f0b]/92 border border-border rounded-xl px-3 py-2 backdrop-blur-sm">
            <p className="text-[10px] text-zinc-500 mb-1.5">NDVI Index</p>
            <div className="flex gap-0.5 mb-1">
              {NDVI_LEGEND.map((stop) => (
                <div key={stop.label} className="w-6 h-2.5 rounded-sm" style={{ background: stop.color }} title={stop.label} />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-zinc-600">
              <span>Sparse</span>
              <span>Dense</span>
            </div>
          </div>
        </div>
      )}

      {/* Satellite label */}
      {layerMode === "satellite" && (
        <div className="absolute bottom-3 left-3 z-[999]">
          <div className="bg-[#080f0b]/80 border border-border rounded-xl px-2.5 py-1.5 backdrop-blur-sm flex items-center gap-1.5">
            <Satellite className="w-3 h-3 text-green-400/60" />
            <span className="text-[10px] text-zinc-500">ESRI World Imagery</span>
          </div>
        </div>
      )}

      {layerMode === "road" && (
        <div className="absolute bottom-3 left-3 z-[999]">
          <div className="bg-[#080f0b]/80 border border-border rounded-xl px-2.5 py-1.5 backdrop-blur-sm flex items-center gap-1.5">
            <Map className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] text-zinc-500">OpenStreetMap</span>
          </div>
        </div>
      )}

      {/* No farms message */}
      {ready && farms.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[998] pointer-events-none">
          <div className="bg-[#080f0b]/90 border border-border rounded-2xl px-6 py-4 text-center">
            <Layers className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/60">No farms to display</p>
            <p className="text-xs text-muted-foreground/40 mt-0.5">Add farms with boundaries to see satellite analytics</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Popup builder ─────────────────────────────────────────────────────────────

function buildPopup(farm: Farm, ndvi: number): string {
  const color = ndvi >= 0.55 ? "#4ade80" : ndvi >= 0.35 ? "#fbbf24" : "#ef4444";
  const label = ndvi >= 0.70 ? "Dense" : ndvi >= 0.55 ? "Very Healthy" : ndvi >= 0.35 ? "Healthy" : ndvi >= 0.15 ? "Moderate" : "Sparse";
  return `
    <div style="min-width:190px;font-family:Inter,system-ui,sans-serif">
      <div style="font-weight:700;color:#e8f5ec;margin-bottom:3px;font-size:13px;">${farm.name}</div>
      ${farm.farmerName ? `<div style="color:#6ea882;font-size:11px;margin-bottom:5px;">${farm.farmerName}</div>` : ""}
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <div style="flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${Math.round(ndvi*100)}%;background:${color};border-radius:99px;"></div>
        </div>
        <span style="font-size:12px;font-weight:600;color:${color};font-variant-numeric:tabular-nums">${ndvi.toFixed(3)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#7a9e87;">
        <span>${farm.areaHectares.toFixed(1)} ha · ${farm.cropType}</span>
        <span style="color:${color}">${label}</span>
      </div>
      <div style="font-size:11px;color:#4a6e58;margin-top:3px">${farm.location}, ${farm.state}</div>
    </div>`;
}
