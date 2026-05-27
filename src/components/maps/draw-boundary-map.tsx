"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Pencil,
  Trash2,
  CheckCircle2,
  RotateCcw,
  MapPin,
  Maximize2,
} from "lucide-react";
import type { FarmBoundary, GeoPoint } from "@/types";

// ── Geodesic area (spherical excess formula) ─────────────────────────────────
function geodesicAreaHa(pts: Array<{ lat: number; lng: number }>): number {
  if (pts.length < 3) return 0;
  const R = 6378137;
  const d2r = Math.PI / 180;
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = pts[i].lng * d2r;
    const xj = pts[j].lng * d2r;
    const yi = pts[i].lat * d2r;
    const yj = pts[j].lat * d2r;
    area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
  }
  return Math.abs((area * R * R) / 2) / 10_000;
}

function centroid(pts: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  return { lat, lng };
}

// ── Leaflet type shims (dynamic import) ──────────────────────────────────────
type LType = typeof import("leaflet");

// ── Component ─────────────────────────────────────────────────────────────────

export interface DrawBoundaryMapProps {
  height?: string;
  initialCenter?: [number, number];
  existingBoundary?: FarmBoundary | null;
  onBoundaryChange?: (boundary: FarmBoundary | null) => void;
  onAreaChange?: (areaHectares: number) => void;
  onCenterChange?: (point: GeoPoint) => void;
  readOnly?: boolean;
}

type DrawMode = "idle" | "drawing" | "drawn";

const POLY_STYLE = {
  color: "#4ade80",
  fillColor: "#4ade80",
  fillOpacity: 0.13,
  weight: 2,
  opacity: 0.75,
  dashArray: undefined as string | undefined,
};

const PREVIEW_STYLE = {
  color: "#4ade80",
  weight: 1.5,
  opacity: 0.5,
  dashArray: "6 4",
};

export function DrawBoundaryMap({
  height = "380px",
  initialCenter = [20.5937, 78.9629],
  existingBoundary,
  onBoundaryChange,
  onAreaChange,
  onCenterChange,
  readOnly = false,
}: DrawBoundaryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<InstanceType<LType["Map"]> | null>(null);
  const LRef = useRef<LType | null>(null);
  const polygonRef = useRef<InstanceType<LType["Polygon"]> | null>(null);
  const polylineRef = useRef<InstanceType<LType["Polyline"]> | null>(null);
  const previewRef = useRef<InstanceType<LType["Polyline"]> | null>(null);
  const markerGroupRef = useRef<InstanceType<LType["LayerGroup"]> | null>(null);
  const verticesRef = useRef<Array<{ lat: number; lng: number }>>([]);

  const [mode, setMode] = useState<DrawMode>(existingBoundary ? "drawn" : "idle");
  const [vertexCount, setVertexCount] = useState(0);
  const [areaHa, setAreaHa] = useState(0);
  const [ready, setReady] = useState(false);

  // ── Emit helpers ──────────────────────────────────────────────────────────
  const emitBoundary = useCallback(
    (pts: Array<{ lat: number; lng: number }>) => {
      if (pts.length < 3) {
        onBoundaryChange?.(null);
        return;
      }
      const coords = pts.map((p) => [p.lng, p.lat] as [number, number]);
      coords.push(coords[0]); // close ring
      const boundary: FarmBoundary = { type: "Polygon", coordinates: [coords] };
      const area = geodesicAreaHa(pts);
      onBoundaryChange?.(boundary);
      onAreaChange?.(parseFloat(area.toFixed(4)));
      onCenterChange?.(centroid(pts));
      setAreaHa(area);
    },
    [onBoundaryChange, onAreaChange, onCenterChange]
  );

  // ── Redraw polygon layer from vertices ────────────────────────────────────
  const redrawLayers = useCallback((pts: Array<{ lat: number; lng: number }>) => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Remove existing
    polygonRef.current?.remove();
    polylineRef.current?.remove();
    markerGroupRef.current?.clearLayers();

    if (pts.length === 0) {
      polygonRef.current = null;
      polylineRef.current = null;
      return;
    }

    const latlngs = pts.map((p) => [p.lat, p.lng] as [number, number]);

    if (pts.length >= 2) {
      const pl = L.polyline(latlngs, {
        color: "#4ade80",
        weight: 2,
        opacity: 0.7,
        dashArray: pts.length < 3 ? "6 4" : undefined,
      }).addTo(map);
      polylineRef.current = pl;
    }

    if (pts.length >= 3) {
      const poly = L.polygon(latlngs, POLY_STYLE).addTo(map);
      polygonRef.current = poly;
      polylineRef.current?.remove();
      polylineRef.current = null;
    }

    // Vertex markers
    const mg = markerGroupRef.current!;
    pts.forEach((p, i) => {
      const isFirst = i === 0;
      L.circleMarker([p.lat, p.lng], {
        radius: isFirst ? 7 : 5,
        color: isFirst ? "#22c55e" : "#4ade80",
        fillColor: isFirst ? "#22c55e" : "#4ade80",
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(mg);
    });
  }, []);

  // ── Finish drawing ─────────────────────────────────────────────────────────
  const finishDrawing = useCallback(() => {
    const pts = verticesRef.current;
    if (pts.length < 3) return;
    setMode("drawn");
    emitBoundary(pts);
    redrawLayers(pts);
    setVertexCount(pts.length);

    // Remove preview line
    previewRef.current?.remove();
    previewRef.current = null;

    // Remove map handlers
    const map = mapRef.current;
    if (map) {
      map.getContainer().style.cursor = "";
    }
  }, [emitBoundary, redrawLayers]);

  // ── Clear everything ───────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    verticesRef.current = [];
    setVertexCount(0);
    setAreaHa(0);
    setMode("idle");

    polygonRef.current?.remove();
    polygonRef.current = null;
    polylineRef.current?.remove();
    polylineRef.current = null;
    previewRef.current?.remove();
    previewRef.current = null;
    markerGroupRef.current?.clearLayers();

    onBoundaryChange?.(null);
    onAreaChange?.(0);

    const map = mapRef.current;
    if (map) map.getContainer().style.cursor = "";
  }, [onBoundaryChange, onAreaChange]);

  // ── Map initialisation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
        doubleClickZoom: false,
      });

      // Satellite/roadmap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Marker group always present
      const mg = L.layerGroup().addTo(map);
      markerGroupRef.current = mg;

      // ── Load existing boundary ──────────────────────────────────────────
      if (existingBoundary?.coordinates?.[0]?.length) {
        const pts = existingBoundary.coordinates[0].slice(0, -1).map(
          ([lng, lat]) => ({ lat, lng })
        );
        verticesRef.current = pts;
        const latlngs = pts.map((p) => [p.lat, p.lng] as [number, number]);
        const poly = L.polygon(latlngs, POLY_STYLE).addTo(map);
        polygonRef.current = poly;
        pts.forEach((p, i) => {
          L.circleMarker([p.lat, p.lng], {
            radius: i === 0 ? 7 : 5,
            color: i === 0 ? "#22c55e" : "#4ade80",
            fillColor: i === 0 ? "#22c55e" : "#4ade80",
            fillOpacity: 0.9,
            weight: 2,
          }).addTo(mg);
        });
        map.fitBounds(poly.getBounds(), { padding: [24, 24] });
        const area = geodesicAreaHa(pts);
        setAreaHa(area);
        setVertexCount(pts.length);
      }

      // ── Map events ────────────────────────────────────────────────────
      map.on("click", (e) => {
        // Only handle clicks in draw mode
        // mode state is stale in closure — use ref trick
        const modeEl = containerRef.current?.getAttribute("data-mode");
        if (modeEl !== "drawing") return;

        const pt = { lat: e.latlng.lat, lng: e.latlng.lng };
        verticesRef.current = [...verticesRef.current, pt];
        const pts = verticesRef.current;
        setVertexCount(pts.length);
        if (pts.length >= 3) setAreaHa(geodesicAreaHa(pts));
        redrawLayers(pts);
      });

      map.on("dblclick", (e) => {
        const modeEl = containerRef.current?.getAttribute("data-mode");
        if (modeEl !== "drawing") return;
        e.originalEvent.preventDefault();
        if (verticesRef.current.length >= 3) {
          finishDrawing();
        }
      });

      map.on("mousemove", (e) => {
        const modeEl = containerRef.current?.getAttribute("data-mode");
        if (modeEl !== "drawing" || verticesRef.current.length === 0) return;
        const pts = verticesRef.current;
        const last = pts[pts.length - 1];
        const cursor = e.latlng;

        previewRef.current?.remove();
        previewRef.current = L.polyline(
          [
            [last.lat, last.lng],
            [cursor.lat, cursor.lng],
          ],
          PREVIEW_STYLE
        ).addTo(map);
      });

      mapRef.current = map;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep data-mode attr in sync so click handler can read it without stale closure
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setAttribute("data-mode", mode);
    }
  }, [mode]);

  // ── Enter drawing mode ─────────────────────────────────────────────────────
  const startDrawing = useCallback(() => {
    clearAll();
    setMode("drawing");
    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = "crosshair";
    }
  }, [clearAll]);

  // ── Fit map to drawn boundary ──────────────────────────────────────────────
  const fitBounds = useCallback(() => {
    const map = mapRef.current;
    const poly = polygonRef.current;
    if (!map || !poly) return;
    map.fitBounds(poly.getBounds(), { padding: [24, 24] });
  }, []);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-border"
      style={{ height }}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      {!readOnly && ready && (
        <div className="absolute top-3 right-3 z-[999] flex flex-col gap-1.5">
          {mode === "idle" && (
            <button
              onClick={startDrawing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/15 border border-green-500/35 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-all backdrop-blur-sm"
              title="Draw farm boundary polygon"
            >
              <Pencil className="w-3 h-3" />
              Draw Boundary
            </button>
          )}

          {mode === "drawing" && (
            <>
              {vertexCount >= 3 && (
                <button
                  onClick={finishDrawing}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-semibold hover:bg-green-500/30 transition-all backdrop-blur-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Finish
                </button>
              )}
              <button
                onClick={clearAll}
                className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-red-400 hover:border-red-500/30 transition-all backdrop-blur-sm"
                title="Cancel drawing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {mode === "drawn" && (
            <>
              <button
                onClick={fitBounds}
                className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all backdrop-blur-sm"
                title="Fit to boundary"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={startDrawing}
                className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-all backdrop-blur-sm"
                title="Redraw boundary"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={clearAll}
                className="w-8 h-8 rounded-xl bg-[#080f0b]/90 border border-border flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all backdrop-blur-sm"
                title="Delete boundary"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      {ready && (
        <div className="absolute bottom-3 left-3 right-14 z-[999] pointer-events-none">
          {mode === "idle" && !readOnly && (
            <div className="inline-flex items-center gap-1.5 bg-[#080f0b]/85 border border-border rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <MapPin className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground/60">
                Click &quot;Draw Boundary&quot; to outline your farm
              </span>
            </div>
          )}

          {mode === "drawing" && (
            <div className="inline-flex items-center gap-1.5 bg-green-900/50 border border-green-500/25 rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <Pencil className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-300">
                {vertexCount === 0
                  ? "Click on the map to add vertices"
                  : vertexCount < 3
                  ? `${vertexCount} point${vertexCount > 1 ? "s" : ""} — add ${3 - vertexCount} more`
                  : `${vertexCount} vertices · ${areaHa.toFixed(2)} ha — double-click or Finish`}
              </span>
            </div>
          )}

          {mode === "drawn" && (
            <div className="inline-flex items-center gap-1.5 bg-[#080f0b]/85 border border-green-500/25 rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-300 font-medium">
                {areaHa.toFixed(2)} ha · {vertexCount} vertices
              </span>
            </div>
          )}

          {mode === "drawn" && readOnly && areaHa > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-[#080f0b]/85 border border-green-500/25 rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-300 font-medium">
                {areaHa.toFixed(2)} ha · {vertexCount} vertices mapped
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
