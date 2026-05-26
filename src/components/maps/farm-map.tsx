"use client";

import { useEffect, useRef } from "react";
import { Layers, ZoomIn, ZoomOut } from "lucide-react";
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: true,
      });

      // Dark satellite-style tile layer
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          className: "map-tiles",
        }
      ).addTo(map);

      // Custom farm marker
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

      // Add farm markers
      farms.forEach((farm) => {
        if (!farm.coordinates) return;
        const marker = L.marker(
          [farm.coordinates.lat, farm.coordinates.lng],
          { icon: farmIcon }
        );

        marker.bindPopup(`
          <div style="min-width:160px">
            <div style="font-weight:600;color:#e8f5ec;margin-bottom:4px;">${farm.name}</div>
            <div style="color:#7a9e87;font-size:12px;">${farm.areaHectares} ha · ${farm.cropType}</div>
            <div style="color:#4ade80;font-size:11px;margin-top:4px;">Status: ${farm.status}</div>
          </div>
        `);

        if (onFarmClick) {
          marker.on("click", () => onFarmClick(farm));
        }

        marker.addTo(map);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#142e1e]" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />

      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[999]">
          <button className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-[#142e1e] flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm">
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-[#142e1e] flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
            onClick={() => {
              const m = mapInstanceRef.current as { zoomIn?: () => void } | null;
              m?.zoomIn?.();
            }}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-[#142e1e] flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
            onClick={() => {
              const m = mapInstanceRef.current as { zoomOut?: () => void } | null;
              m?.zoomOut?.();
            }}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* NDVI legend */}
      <div className="absolute bottom-3 left-3 z-[999]">
        <div className="bg-[#080f0b]/90 border border-[#142e1e] rounded-xl px-3 py-2 backdrop-blur-sm">
          <p className="text-xs text-zinc-600 mb-1.5">NDVI</p>
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
      className="rounded-2xl border border-[#142e1e] bg-[#070e09] flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/15 flex items-center justify-center mx-auto mb-3">
          <Layers className="w-5 h-5 text-green-400" />
        </div>
        <p className="text-sm text-zinc-500">Map loading...</p>
      </div>
    </div>
  );
}
