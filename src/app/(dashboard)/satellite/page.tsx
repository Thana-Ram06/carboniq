"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Layers,
  TrendingUp,
  Droplets,
  Sun,
  Cloud,
  RefreshCw,
  Satellite,
  Map,
  BarChart3,
  CheckCircle2,
  Leaf,
  Activity,
  ChevronRight,
  Info,
  Zap,
  Wind,
  Brain,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NDVIChart } from "@/components/dashboard/carbon-chart";
import { useAuth } from "@/hooks/use-auth";
import { useFarms } from "@/hooks/use-farms";
import { saveSatelliteScan } from "@/lib/firestore";
import { computeHealthScore, healthColorClass } from "@/lib/intelligence/health-scoring";
import { generateInsights } from "@/lib/intelligence/insights-engine";
import type { Insight } from "@/types";
import { computeSeasonalBaseline } from "@/lib/intelligence/historical-analytics";
import { InsightCard } from "@/components/intelligence/InsightCard";
import { HealthScoreRing } from "@/components/intelligence/HealthScoreRing";
import {
  computeFarmNDVI,
  ndviStatusLabel,
  ndviBadgeVariant,
  ndviBorder,
  type ComputedNDVI,
  type NDVIMonthPoint,
} from "@/lib/satellite/ndvi-engine";
import { LAYER_LABELS, type LayerMode } from "@/lib/satellite/tile-layers";
import { getNDVIColor } from "@/lib/utils";
import type { Farm } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

const SatelliteMap = dynamic(
  () => import("@/components/maps/satellite-map").then((m) => m.SatelliteMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] rounded-2xl bg-card border border-border animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Satellite className="w-7 h-7 text-green-500/25 animate-pulse" />
          <p className="text-xs text-muted-foreground/50">Loading satellite map…</p>
        </div>
      </div>
    ),
  }
);

// ── NDVI Bar ──────────────────────────────────────────────────────────────────

function NDVIBar({ value, showLabel = false }: { value: number; showLabel?: boolean }) {
  const color = getNDVIColor(value);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(4, value * 100)}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono text-foreground tabular-nums w-11 text-right">
        {value.toFixed(3)}
      </span>
      {showLabel && (
        <Badge variant={ndviBadgeVariant(value)} size="sm">
          {ndviStatusLabel(
            value >= 0.70 ? "dense" :
            value >= 0.55 ? "very_healthy" :
            value >= 0.35 ? "healthy" :
            value >= 0.15 ? "moderate" : "sparse"
          )}
        </Badge>
      )}
    </div>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit?: string;
  status: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground/60">{label}</p>
        <p className="text-base font-bold text-foreground tabular-nums">
          {value}
          {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
      <Badge
        variant={status === "Good" || status === "Healthy" || status === "Above Avg" || status === "Dense" ? "green" : status === "Moderate" ? "yellow" : "gray"}
        size="sm"
      >
        {status}
      </Badge>
    </div>
  );
}

// ── Scan Button ───────────────────────────────────────────────────────────────

function ScanStatusPill({ source, scannedAt }: { source: string; scannedAt?: string }) {
  const isReal = source === "sentinel_hub";
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs ${
      isReal
        ? "bg-blue-500/10 border-blue-500/25 text-blue-300"
        : "bg-muted border-border text-muted-foreground/60"
    }`}>
      {isReal ? <Satellite className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
      {isReal ? "Sentinel-2 Real Data" : "Computed Analytics"}
      {scannedAt && (
        <span className="opacity-60 ml-1">· {new Date(scannedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SatellitePage() {
  const { user } = useAuth();
  const { farms, loading: farmsLoading } = useFarms(user?.uid ?? null);

  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [layerMode, setLayerMode] = useState<LayerMode>("satellite");
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<Record<string, ComputedNDVI>>({});
  const [scanSources, setScanSources] = useState<Record<string, string>>({});
  const [farmInsights, setFarmInsights] = useState<Record<string, Insight[]>>({});

  // ── Compute NDVI + intelligence for all farms on load ────────────────────
  useEffect(() => {
    if (farms.length === 0) return;
    const results: Record<string, ComputedNDVI> = {};
    const insights: Record<string, Insight[]> = {};
    const month = new Date().getMonth();

    farms.forEach((farm) => {
      const result = computeFarmNDVI({
        farmId: farm.id,
        cropType: farm.cropType,
        irrigationType: farm.irrigationType,
        state: farm.state,
        areaHectares: farm.areaHectares,
      });
      results[farm.id] = result;

      const baseline = computeSeasonalBaseline(farm.state, farm.cropType, month);
      insights[farm.id] = generateInsights(
        farm,
        result.current.ndvi,
        undefined,
        baseline
      );
    });

    setScanResults(results);
    setFarmInsights(insights);
    if (!selectedFarmId && farms.length > 0) {
      setSelectedFarmId(farms[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farms]);

  // ── NDVI scores map for the satellite map ─────────────────────────────────
  const ndviScores = useMemo(() => {
    const m: Record<string, number> = {};
    Object.entries(scanResults).forEach(([farmId, res]) => {
      m[farmId] = res.current.ndvi;
    });
    return m;
  }, [scanResults]);

  // ── Selected farm data ────────────────────────────────────────────────────
  const selectedFarm = farms.find((f) => f.id === selectedFarmId);
  const selectedResult = selectedFarmId ? scanResults[selectedFarmId] : null;

  // ── Scan individual farm (calls API) ──────────────────────────────────────
  const scanFarm = useCallback(async (farm: Farm) => {
    setScanning(true);
    try {
      const res = await fetch("/api/satellite/ndvi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId:         farm.id,
          cropType:       farm.cropType,
          irrigationType: farm.irrigationType,
          state:          farm.state,
          boundary:       farm.boundary,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as {
        ndvi: number; ndwi: number; evi: number; savi: number;
        vegetationCoverage: number; moistureIndex: number; cloudCoverage: number;
        healthStatus: string; trend: string; source: string; computedAt: string;
        timeSeries: NDVIMonthPoint[] | null;
      };

      // Merge into local state
      setScanResults((prev) => ({
        ...prev,
        [farm.id]: {
          current: {
            ndvi:  data.ndvi, ndwi:  data.ndwi, evi:   data.evi, savi:  data.savi,
            vegetationCoverage: data.vegetationCoverage,
            moistureIndex:      data.moistureIndex,
            cloudCoverage:      data.cloudCoverage,
          },
          timeSeries: data.timeSeries ?? prev[farm.id]?.timeSeries ?? [],
          healthStatus: data.healthStatus as ComputedNDVI["healthStatus"],
          trend:        data.trend as ComputedNDVI["trend"],
          source:       "computed",
          computedAt:   data.computedAt,
        },
      }));
      setScanSources((prev) => ({ ...prev, [farm.id]: data.source }));

      // Persist to Firestore
      if (user?.uid) {
        await saveSatelliteScan({
          farmId: farm.id, userId: user.uid,
          ndvi:  data.ndvi, ndwi:  data.ndwi, evi:   data.evi, savi:  data.savi,
          vegetationCoverage: data.vegetationCoverage,
          moistureIndex:      data.moistureIndex,
          cloudCoverage:      data.cloudCoverage,
          healthStatus:       data.healthStatus,
          trend:              data.trend,
          source:             data.source as "sentinel_hub" | "computed",
        });
      }

      toast.success(`Scan complete — NDVI: ${data.ndvi.toFixed(3)}`);
    } catch {
      toast.error("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  }, [user]);

  // ── Scan all farms ────────────────────────────────────────────────────────
  const scanAllFarms = useCallback(async () => {
    if (farms.length === 0) return;
    setScanning(true);
    for (const farm of farms) {
      await scanFarm(farm);
    }
    setScanning(false);
    toast.success("All farms scanned");
  }, [farms, scanFarm]);

  // ── Chart data for selected farm ──────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!selectedResult) return [];
    return selectedResult.timeSeries.map((pt) => ({
      month: pt.month,
      ndvi: pt.ndvi,
      biomass: parseFloat((pt.ndvi * 8.4).toFixed(2)), // Derived biomass proxy (t/ha)
    }));
  }, [selectedResult]);

  // ── Aggregate stats ───────────────────────────────────────────────────────
  const avgNDVI = useMemo(() => {
    const vals = Object.values(ndviScores);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [ndviScores]);

  const withBoundary = farms.filter((f) => f.boundary?.coordinates?.length);

  if (farmsLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-card rounded-xl w-64" />
        <div className="h-[440px] bg-card rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Satellite Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {farms.length} farm{farms.length !== 1 ? "s" : ""} ·{" "}
            {withBoundary.length} with boundary ·{" "}
            ESRI World Imagery + computed vegetation intelligence
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ScanStatusPill
            source={selectedFarmId ? (scanSources[selectedFarmId] ?? "computed") : "computed"}
            scannedAt={selectedResult?.computedAt}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedFarm && scanFarm(selectedFarm)}
            disabled={scanning || !selectedFarm}
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
            Scan Farm
          </Button>
          <Button variant="primary" size="sm" onClick={scanAllFarms} disabled={scanning || farms.length === 0}>
            <Zap className="w-4 h-4" />
            Scan All
          </Button>
        </div>
      </div>

      {/* ── Layer switcher + Farm tabs ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Layer mode */}
        <div className="flex bg-card border border-border rounded-xl p-1 gap-1">
          {(["road", "satellite", "ndvi"] as LayerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setLayerMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                layerMode === mode
                  ? "bg-green-500/15 border border-green-500/30 text-green-300"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              {mode === "road" && <Map className="w-3 h-3" />}
              {mode === "satellite" && <Satellite className="w-3 h-3" />}
              {mode === "ndvi" && <Layers className="w-3 h-3" />}
              {LAYER_LABELS[mode]}
            </button>
          ))}
        </div>

        {/* Farm selector */}
        {farms.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {farms.map((farm) => {
              const ndvi = ndviScores[farm.id] ?? 0;
              const isSelected = farm.id === selectedFarmId;
              return (
                <button
                  key={farm.id}
                  onClick={() => setSelectedFarmId(farm.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-green-500/12 border-green-500/30 text-green-300"
                      : "bg-card border-border text-muted-foreground/60 hover:text-foreground hover:border-green-500/20"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: ndviBorder(ndvi) }}
                  />
                  {farm.name}
                  <span className="font-mono opacity-70">{ndvi.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {farms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-3xl bg-green-500/8 border border-green-500/15 flex items-center justify-center mb-5">
            <Satellite className="w-7 h-7 text-green-400/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No farms to analyse</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Register farms with drawn boundaries to enable satellite vegetation analytics.
          </p>
          <Link href="/farms">
            <Button variant="primary">
              <Map className="w-4 h-4" /> Go to Farm Management
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* ── Main map + metrics ─────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {layerMode === "ndvi" ? (
                        <><Layers className="w-4 h-4 text-green-400" /> NDVI Vegetation Map</>
                      ) : layerMode === "satellite" ? (
                        <><Satellite className="w-4 h-4 text-blue-400" /> Satellite Imagery</>
                      ) : (
                        <><Map className="w-4 h-4 text-muted-foreground/60" /> Road Map</>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {layerMode === "ndvi" && (
                        <Badge variant="green" dot size="sm">NDVI Active</Badge>
                      )}
                      {layerMode === "satellite" && (
                        <Badge variant="blue" size="sm">ESRI Imagery</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SatelliteMap
                    farms={farms}
                    ndviScores={ndviScores}
                    selectedFarmId={selectedFarmId}
                    layerMode={layerMode}
                    height="400px"
                    onFarmSelect={setSelectedFarmId}
                  />
                  {layerMode === "satellite" && (
                    <p className="mt-2 text-xs text-muted-foreground/50 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Real satellite imagery from ESRI World Imagery (free). Switch to NDVI Mode to see vegetation index overlays.
                    </p>
                  )}
                  {layerMode === "ndvi" && (
                    <p className="mt-2 text-xs text-muted-foreground/50 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Polygons colored by NDVI: red (sparse) → green (dense). Add{" "}
                      <code className="mx-1 px-1 py-0.5 rounded bg-muted text-green-400 text-[10px]">SENTINEL_HUB_CLIENT_ID</code>
                      env var for real per-pixel imagery.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analytics sidebar */}
            <div className="flex flex-col gap-3">
              {selectedResult ? (
                <>
                  <MetricCard
                    icon={Leaf}
                    label="NDVI Index"
                    value={selectedResult.current.ndvi.toFixed(3)}
                    status={ndviStatusLabel(selectedResult.healthStatus)}
                    color="text-green-400"
                    bg="bg-green-500/8"
                  />
                  <MetricCard
                    icon={Droplets}
                    label="NDWI (Moisture)"
                    value={selectedResult.current.ndwi.toFixed(3)}
                    status={selectedResult.current.moistureIndex > 0.5 ? "Good" : "Moderate"}
                    color="text-blue-400"
                    bg="bg-blue-500/8"
                  />
                  <MetricCard
                    icon={Sun}
                    label="Vegetation Cover"
                    value={`${selectedResult.current.vegetationCoverage}%`}
                    status={selectedResult.current.vegetationCoverage > 70 ? "Above Avg" : "Moderate"}
                    color="text-yellow-400"
                    bg="bg-yellow-500/8"
                  />
                  <MetricCard
                    icon={Cloud}
                    label="Cloud Cover"
                    value={`${selectedResult.current.cloudCoverage}%`}
                    status={selectedResult.current.cloudCoverage < 20 ? "Clear" : "Cloudy"}
                    color="text-muted-foreground"
                    bg="bg-muted"
                  />
                  {/* EVI / SAVI */}
                  <div className="p-3.5 rounded-2xl border border-border bg-card">
                    <p className="text-xs text-muted-foreground/60 mb-3">Advanced Indices</p>
                    <div className="space-y-2.5">
                      {[
                        { label: "EVI", value: selectedResult.current.evi, desc: "Enhanced Vegetation" },
                        { label: "SAVI", value: selectedResult.current.savi, desc: "Soil-Adjusted" },
                      ].map((b) => (
                        <div key={b.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground font-medium">{b.label}</span>
                            <span className="font-mono text-muted-foreground">{b.value.toFixed(3)}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.max(4, b.value * 100)}%`, background: getNDVIColor(b.value) }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground/40 mt-0.5">{b.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="p-3.5 rounded-2xl border border-border bg-card flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/8 flex items-center justify-center shrink-0">
                      <TrendingUp className={`w-4 h-4 ${
                        selectedResult.trend === "increasing" ? "text-green-400" :
                        selectedResult.trend === "decreasing" ? "text-red-400" : "text-muted-foreground/60"
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground/60">Seasonal trend</p>
                      <p className="text-sm font-semibold text-foreground capitalize">{selectedResult.trend}</p>
                    </div>
                    {selectedFarm && (
                      <button
                        onClick={() => scanFarm(selectedFarm)}
                        disabled={scanning}
                        className="ml-auto text-xs text-green-400/60 hover:text-green-400 transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${scanning ? "animate-spin" : ""}`} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center py-12 text-muted-foreground/40 text-sm">
                  Select a farm to view analytics
                </div>
              )}
            </div>
          </div>

          {/* ── Farm NDVI comparison ──────────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Farm NDVI Comparison</CardTitle>
                  <Badge variant="green" size="sm">
                    Avg {avgNDVI.toFixed(3)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...farms]
                    .sort((a, b) => (ndviScores[b.id] ?? 0) - (ndviScores[a.id] ?? 0))
                    .map((farm) => {
                      const ndvi = ndviScores[farm.id] ?? 0;
                      const result = scanResults[farm.id];
                      const isSelected = farm.id === selectedFarmId;
                      return (
                        <button
                          key={farm.id}
                          onClick={() => setSelectedFarmId(farm.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? "border-green-500/30 bg-green-500/5"
                              : "border-transparent hover:border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-foreground font-medium truncate max-w-[180px]">
                              {farm.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={ndviBadgeVariant(ndvi)} size="sm">
                                {result ? ndviStatusLabel(result.healthStatus) : "—"}
                              </Badge>
                              <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                            </div>
                          </div>
                          <NDVIBar value={ndvi} />
                          {result && (
                            <div className="flex gap-3 text-[10px] text-muted-foreground/40 mt-1.5">
                              <span>Cover: {result.current.vegetationCoverage}%</span>
                              <span>Moisture: {result.current.moistureIndex.toFixed(2)}</span>
                              <span>EVI: {result.current.evi.toFixed(3)}</span>
                              <span className={result.trend === "increasing" ? "text-green-400/60" : result.trend === "decreasing" ? "text-red-400/60" : ""}>
                                {result.trend === "increasing" ? "↑" : result.trend === "decreasing" ? "↓" : "→"} {result.trend}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  {farms.length === 0 && (
                    <p className="text-sm text-muted-foreground/50 text-center py-4">No farms to compare</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* NDVI time series */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedFarm ? `${selectedFarm.name} — ` : ""}NDVI Time Series
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedResult && (
                      <div
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ background: ndviBorder(selectedResult.current.ndvi) }}
                      />
                    )}
                    <Badge variant="gray" size="sm">12 months</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <>
                    <NDVIChart data={chartData} className="h-[200px]" />
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { label: "Peak NDVI", value: Math.max(...chartData.map((d) => d.ndvi)).toFixed(3), color: "text-green-400" },
                        { label: "Min NDVI", value: Math.min(...chartData.map((d) => d.ndvi)).toFixed(3), color: "text-amber-400" },
                        { label: "Current", value: selectedResult?.current.ndvi.toFixed(3) ?? "—", color: "text-foreground" },
                      ].map((s) => (
                        <div key={s.label} className="p-2.5 rounded-xl bg-muted border border-border">
                          <p className="text-[10px] text-muted-foreground/50">{s.label}</p>
                          <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Crop season indicator */}
                    {selectedFarm && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/60">
                        <Wind className="w-3.5 h-3.5" />
                        <span>
                          {selectedFarm.cropType} · {selectedFarm.irrigationType} irrigation ·{" "}
                          {selectedFarm.state}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground/40">Select a farm to see time series</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Farm Intelligence Summary ────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-green-400" />
                  Farm Intelligence Summary
                </CardTitle>
                <Badge variant="green" size="sm">
                  {farms.length} farm{farms.length !== 1 ? "s" : ""} analysed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {farms.map((farm) => {
                  const ndvi = ndviScores[farm.id] ?? 0;
                  const hs = computeHealthScore(ndvi);
                  const topInsight = farmInsights[farm.id]?.[0];
                  const isSelected = farm.id === selectedFarmId;
                  return (
                    <button
                      key={farm.id}
                      onClick={() => setSelectedFarmId(farm.id)}
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-border bg-card hover:border-green-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <HealthScoreRing
                          healthScore={hs}
                          size={56}
                          strokeWidth={5}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {farm.name}
                          </p>
                          <p className="text-xs text-muted-foreground/50 truncate">
                            {farm.cropType} · {farm.areaHectares.toFixed(1)} ha
                          </p>
                          <p
                            className={`text-xs font-mono mt-0.5 ${healthColorClass(hs.color)}`}
                          >
                            NDVI {ndvi.toFixed(3)}
                          </p>
                        </div>
                      </div>
                      {topInsight && (
                        <InsightCard insight={topInsight} compact />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Selected farm insights detail ─────────────────────────────── */}
          {selectedFarm && farmInsights[selectedFarm.id]?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground/60" />
                  {selectedFarm.name} — Intelligence Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {farmInsights[selectedFarm.id].map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Band analysis + integration status ─────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Band cards */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Spectral Band Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedResult ? (
                      [
                        { name: "NDVI", value: selectedResult.current.ndvi, desc: "Normalized Difference Vegetation Index — primary health indicator", icon: Leaf, color: "text-green-400" },
                        { name: "NDWI", value: selectedResult.current.ndwi, desc: "Normalized Difference Water Index — moisture & irrigation status", icon: Droplets, color: "text-blue-400" },
                        { name: "EVI", value: selectedResult.current.evi, desc: "Enhanced Vegetation Index — canopy background corrected", icon: BarChart3, color: "text-emerald-400" },
                        { name: "SAVI", value: selectedResult.current.savi, desc: "Soil-Adjusted Vegetation Index — compensates for bare soil reflectance", icon: Activity, color: "text-amber-400" },
                      ].map((band) => {
                        const Icon = band.icon;
                        const pct = Math.max(4, (band.value + 0.2) / 1.2 * 100);
                        return (
                          <div key={band.name} className="p-4 rounded-2xl border border-border bg-muted/40 hover:bg-card transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`w-3.5 h-3.5 ${band.color}`} />
                                <span className="text-sm font-semibold text-foreground">{band.name}</span>
                              </div>
                              <span className={`text-sm font-bold font-mono ${band.color}`}>
                                {band.value.toFixed(3)}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-border overflow-hidden mb-2">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: getNDVIColor(band.value) }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground/50 leading-relaxed">{band.desc}</p>
                          </div>
                        );
                      })
                    ) : (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl bg-muted border border-border animate-pulse" />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration status */}
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">ESRI World Imagery</span>
                    <Badge variant="green" dot size="sm">Active</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50">Real satellite tiles · Free · No key required</p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">NDVI Engine</span>
                    <Badge variant="green" dot size="sm">Active</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50">Crop phenology + climate zone analytics · Deterministic per farm</p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Sentinel Hub</span>
                    <Badge variant="gray" size="sm">Not configured</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40">Per-pixel NDVI from Sentinel-2 L2A · Add credentials to enable</p>
                  <Link href="/settings">
                    <button className="mt-2 text-[10px] text-green-400/60 hover:text-green-400 flex items-center gap-1 transition-colors">
                      Configure in Settings <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </Link>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Google Earth Engine</span>
                    <Badge variant="gray" size="sm">Planned</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40">MODIS, Landsat 8/9, Sentinel-2 · Phase 3</p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">ISRO Bhuvan</span>
                    <Badge variant="gray" size="sm">Planned</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40">Indian satellite data · ResourceSat-2 · Phase 3</p>
                </div>

                <div className="mt-2 p-3 rounded-xl border border-green-500/15 bg-green-500/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-medium text-green-300">{farms.length} farms analysed</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50">
                    Firestore scan records saved per analysis run.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
