"use client";

import { useEffect, useRef } from "react";
import { Layers, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { Farm } from "@/types";

interface FarmMapProps {
  farms?: Farm[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showControls?: boolean;
  onFarmClick?: (farm: Farm) => void;
}

export function FarmMap({
  farms = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  height = "400px",
  showControls = true,
  onFarmClick,
}: FarmMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapDivRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("leaflet/dist/leaflet.css");

      if (cancelled || !mapDivRef.current) return;

      const map = L.map(mapDivRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Farm icon for coordinate-only farms
      const farmIcon = L.divIcon({
        className: "custom-farm-marker",
        html: `<div style="
          width:28px;height:28px;
          background:rgba(74,222,128,0.15);
          border:2px solid rgba(74,222,128,0.6);
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 12px rgba(74,222,128,0.3);
        ">
          <div style="width:10px;height:10px;background:#4ade80;border-radius:50%;"></div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const boundsGroup: Array<L.LatLng[]> = [];

      farms.forEach((farm) => {
        const popup = `
          <div style="min-width:180px">
            <div style="font-weight:700;color:#e8f5ec;margin-bottom:2px;font-size:13px;">${farm.name}</div>
            ${farm.farmerName ? `<div style="color:#6ea882;font-size:11px;margin-bottom:4px;">${farm.farmerName}</div>` : ""}
            <div style="color:#7a9e87;font-size:12px;">${farm.areaHectares.toFixed(1)} ha · ${farm.cropType}</div>
            <div style="color:#4ade80;font-size:11px;margin-top:4px;">${farm.location}, ${farm.state}</div>
          </div>`;

        if (farm.boundary?.coordinates?.[0]?.length) {
          // Draw polygon
          const ring = farm.boundary.coordinates[0];
          const latlngs = ring.map(([lng, lat]) => L.latLng(lat, lng));
          boundsGroup.push(latlngs);

          const poly = L.polygon(latlngs, {
            color: "#4ade80",
            fillColor: "#4ade80",
            fillOpacity: 0.12,
            weight: 2,
            opacity: 0.7,
          });

          poly.bindPopup(popup);
          if (onFarmClick) poly.on("click", () => onFarmClick(farm));
          poly.addTo(map);

          // Centroid marker
          const c = latlngs.reduce(
            (acc, ll) => ({ lat: acc.lat + ll.lat, lng: acc.lng + ll.lng }),
            { lat: 0, lng: 0 }
          );
          const n = latlngs.length;
          L.circleMarker([c.lat / n, c.lng / n], {
            radius: 5,
            color: "#4ade80",
            fillColor: "#22c55e",
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);
        } else if (farm.coordinates) {
          // Fallback to marker
          const marker = L.marker(
            [farm.coordinates.lat, farm.coordinates.lng],
            { icon: farmIcon }
          );
          boundsGroup.push([L.latLng(farm.coordinates.lat, farm.coordinates.lng)]);
          marker.bindPopup(popup);
          if (onFarmClick) marker.on("click", () => onFarmClick(farm));
          marker.addTo(map);
        }
      });

      // Fit to all farm bounds when multiple farms
      if (farms.length > 1 && boundsGroup.length > 0) {
        const allLatLngs = boundsGroup.flat();
        if (allLatLngs.length > 0) {
          map.fitBounds(L.latLngBounds(allLatLngs), { padding: [32, 32] });
        }
      } else if (farms.length === 1 && farms[0].boundary?.coordinates?.[0]) {
        const ring = farms[0].boundary.coordinates[0];
        const lls = ring.map(([lng, lat]) => L.latLng(lat, lng));
        map.fitBounds(L.latLngBounds(lls), { padding: [32, 32] });
      }

      mapInstanceRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-border"
      style={{ height }}
    >
      <div ref={mapDivRef} className="w-full h-full" />

      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[999]">
          <button
            className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
            onClick={() => {
              const m = mapInstanceRef.current as { fitBounds?: (b: unknown, o?: unknown) => void; getBounds?: () => unknown } | null;
              // fit to all layers on Layers button
              void m;
            }}
            title="Map layers"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
            onClick={() =>
              (mapInstanceRef.current as { zoomIn?: () => void } | null)?.zoomIn?.()
            }
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
            onClick={() =>
              (mapInstanceRef.current as { zoomOut?: () => void } | null)?.zoomOut?.()
            }
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* NDVI legend */}
      <div className="absolute bottom-3 left-3 z-[999]">
        <div className="bg-[#080f0b]/90 border border-border rounded-xl px-3 py-2 backdrop-blur-sm">
          <p className="text-[10px] text-zinc-600 mb-1.5">NDVI</p>
          <div className="flex items-center gap-1">
            {["#ef4444", "#fbbf24", "#86efac", "#4ade80", "#16a34a"].map(
              (color, i) => (
                <div
                  key={i}
                  className="w-4 h-2 rounded-sm"
                  style={{ background: color }}
                />
              )
            )}
          </div>
          <div className="flex justify-between text-[10px] text-zinc-700 mt-1">
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MapPlaceholder({ height = "400px" }: { height?: string }) {
  return (
    <div
      className="rounded-2xl border border-border bg-card flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/15 flex items-center justify-center mx-auto mb-3">
          <Maximize2 className="w-5 h-5 text-green-400" />
        </div>
        <p className="text-sm text-muted-foreground/50">Loading map…</p>
      </div>
    </div>
  );
}
