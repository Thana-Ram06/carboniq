"use client";

import { useMemo, useState } from "react";
import { Brain, Sparkles, AlertTriangle, TrendingUp, Leaf, BarChart3, Map, ChevronDown } from "lucide-react";
import { useFarms } from "@/hooks/use-farms";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnomalyTimeline } from "@/components/ai/AnomalyTimeline";
import { CropIntelligenceCard } from "@/components/ai/CropIntelligenceCard";
import { YieldForecastPanel } from "@/components/ai/YieldForecastPanel";
import { VegetationForecastChart } from "@/components/ai/VegetationForecastChart";
import { ConfidenceGauge } from "@/components/ai/ConfidenceGauge";
import { BenchmarkPanel } from "@/components/ai/BenchmarkPanel";
import { RegionalIntelligenceMap } from "@/components/ai/RegionalIntelligenceMap";
import { detectAnomalies } from "@/lib/ai/anomaly-detector";
import { classifyCrop } from "@/lib/ai/crop-classifier";
import { predictYield } from "@/lib/ai/yield-predictor";
import { forecastVegetation } from "@/lib/ai/vegetation-forecaster";
import { computeConfidence } from "@/lib/ai/confidence-engine";
import { computeBenchmark } from "@/lib/analytics/benchmarking";
import type { AnomalyDetection, CropPrediction, YieldForecast, VegetationForecast, ConfidenceModel, BenchmarkData } from "@/types";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
        <Brain className="w-8 h-8 text-violet-400/60" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">No farms to analyze</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Add farms to unlock AI intelligence</p>
      </div>
    </div>
  );
}

export default function IntelligencePage() {
  const { user } = useAuth();
  const { farms, loading } = useFarms(user?.uid ?? null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  const selectedFarm = useMemo(
    () => selectedFarmId ? farms.find((f) => f.id === selectedFarmId) : farms[0],
    [selectedFarmId, farms]
  );

  const intelligence = useMemo(() => {
    if (!selectedFarm) return null;
    const common = {
      farmId: selectedFarm.id,
      userId: selectedFarm.userId,
      cropType: selectedFarm.cropType,
      irrigationType: selectedFarm.irrigationType,
      state: selectedFarm.state,
      areaHectares: selectedFarm.areaHectares,
    };
    return {
      anomaly: { id: "a", ...detectAnomalies(common), computedAt: null as never } as AnomalyDetection,
      crop:    { id: "c", ...classifyCrop(common),    computedAt: null as never } as CropPrediction,
      yield:   { id: "y", ...predictYield(common),    computedAt: null as never } as YieldForecast,
      forecast:{ id: "f", ...forecastVegetation(common), computedAt: null as never } as VegetationForecast,
      confidence:{ id: "cf", ...computeConfidence({ ...common, evidenceCount: 0, auditApproved: false, hasBoundary: !!selectedFarm.boundary }), computedAt: null as never } as ConfidenceModel,
      benchmark: { id: "b", ...computeBenchmark(common), computedAt: null as never } as BenchmarkData,
    };
  }, [selectedFarm]);

  // Platform-wide anomaly count for the header banner
  const totalAnomalies = useMemo(() =>
    farms.reduce((sum, farm) => {
      const a = detectAnomalies({
        farmId: farm.id, userId: farm.userId, cropType: farm.cropType,
        irrigationType: farm.irrigationType, state: farm.state, areaHectares: farm.areaHectares,
      });
      return sum + a.anomalyCount;
    }, 0), [farms]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">AI Intelligence</h1>
            <p className="text-xs text-muted-foreground/60">
              Predictive analytics · Scientific credibility · Regional intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>{farms.length} farms analyzed</span>
        </div>
      </div>

      {/* Alert banner */}
      {totalAnomalies > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-500/20 bg-orange-500/5">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <p className="text-sm text-orange-300">
            {totalAnomalies} vegetation anomal{totalAnomalies === 1 ? "y" : "ies"} detected across {farms.length} farm{farms.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : farms.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Farm selector */}
          {farms.length > 1 && (
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground/60 flex-shrink-0">Analyzing:</p>
              <div className="relative inline-flex items-center">
                <select
                  value={selectedFarm?.id ?? ""}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-8 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-violet-500/40"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground/40 absolute right-2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* AI Panels — 2 columns */}
          {intelligence && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Row 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Anomaly Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnomalyTimeline detection={intelligence.anomaly} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Leaf className="w-4 h-4 text-green-400" />
                    Crop Classification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CropIntelligenceCard prediction={intelligence.crop} />
                </CardContent>
              </Card>

              {/* Row 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Yield Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <YieldForecastPanel forecast={intelligence.yield} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                    Vegetation Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VegetationForecastChart forecast={intelligence.forecast} />
                </CardContent>
              </Card>

              {/* Row 3 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Scientific Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConfidenceGauge model={intelligence.confidence} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    Regional Benchmark
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BenchmarkPanel data={intelligence.benchmark} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Regional Intelligence Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Map className="w-4 h-4 text-teal-400" />
                Regional Intelligence — All Districts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegionalIntelligenceMap farms={farms} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
