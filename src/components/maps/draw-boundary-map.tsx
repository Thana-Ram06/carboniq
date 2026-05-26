"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check } from "lucide-react";
import type { GeoPoint } from "@/types";

interface DrawBoundaryMapProps {
  initialCenter?: [number, number];
  onBoundaryChange?: (coords: number[][][]) => void;
  onLocationSelect?: (point: GeoPoint) => void;
  height?: string;
}

export function DrawBoundaryMap({
  initialCenter = [20.5937, 78.9629],
  onBoundaryChange,
  onLocationSelect,
  height = "350px",
}: DrawBoundaryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const drawnItemsRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center: initialCenter,
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Click to select location
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        onLocationSelect?.({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      // Drawnitemsgroup placeholder
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

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

  const clearDrawing = () => {
    if (drawnItemsRef.current) {
      (drawnItemsRef.current as { clearLayers: () => void }).clearLayers();
      setHasDrawing(false);
      onBoundaryChange?.([]);
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-[#142e1e]"
      style={{ height }}
    >
      <div ref={mapRef} className="w-full h-full" />

      {/* Draw controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[999]">
        <button
          onClick={() => setDrawMode(!drawMode)}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all backdrop-blur-sm ${
            drawMode
              ? "bg-green-500/20 border-green-500/40 text-green-400"
              : "bg-[#080f0b]/90 border-[#142e1e] text-zinc-400 hover:text-green-400 hover:border-green-500/30"
          }`}
          title="Draw boundary"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        {hasDrawing && (
          <>
            <button
              onClick={clearDrawing}
              className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-[#142e1e] flex items-center justify-center text-red-400 hover:border-red-500/30 transition-all backdrop-blur-sm"
              title="Clear drawing"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 transition-all backdrop-blur-sm"
              title="Confirm boundary"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      {drawMode && (
        <div className="absolute bottom-3 left-3 right-3 z-[999]">
          <div className="bg-[#080f0b]/90 border border-green-500/20 rounded-xl px-3 py-2 backdrop-blur-sm">
            <p className="text-xs text-green-400 text-center">
              Click on the map to select farm location · Draw boundary polygon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
