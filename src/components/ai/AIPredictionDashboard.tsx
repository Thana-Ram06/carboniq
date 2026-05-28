"use client";

import { useMemo, useState } from "react";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import type { Farm } from "@/types";
import { detectAnomalies } from "@/lib/ai/anomaly-detector";
import { classifyCrop } from "@/lib/ai/crop-classifier";
import { predictYield } from "@/lib/ai/yield-predictor";
import { forecastVegetation } from "@/lib/ai/vegetation-forecaster";
import { computeConfidence } from "@/lib/ai/confidence-engine";
import { computeBenchmark } from "@/lib/analytics/benchmarking";
import { AnomalyTimeline } from "./AnomalyTimeline";
import { CropIntelligenceCard } from "./CropIntelligenceCard";
import { YieldForecastPanel } from "./YieldForecastPanel";
import { VegetationForecastChart } from "./VegetationForecastChart";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { BenchmarkPanel } from "./BenchmarkPanel";

interface AIPredictionDashboardProps {
  farm: Farm;
  evidenceCount?: number;
  auditApproved?: boolean;
}

export function AIPredictionDashboard({ farm, evidenceCount = 0, auditApproved = false }: AIPredictionDashboardProps) {
  const [expanded, setExpanded] = useState(true);

  const intelligence = useMemo(() => {
    const commonInput = {
      farmId: farm.id,
      userId: farm.userId,
      cropType: farm.cropType,
      irrigationType: farm.irrigationType,
      state: farm.state,
      areaHectares: farm.areaHectares,
    };

    return {
      anomaly: detectAnomalies(commonInput),
      crop: classifyCrop(commonInput),
      yield: predictYield(commonInput),
      forecast: forecastVegetation(commonInput),
      confidence: computeConfidence({
        ...commonInput,
        evidenceCount,
        auditApproved,
        hasBoundary: !!farm.boundary,
      }),
      benchmark: computeBenchmark(commonInput),
    };
  }, [farm, evidenceCount, auditApproved]);

  const panels = [
    { key: "anomaly",    label: "Anomaly Detection",     content: <AnomalyTimeline detection={{ id: "local", ...intelligence.anomaly, computedAt: null as never }} /> },
    { key: "crop",       label: "Crop Intelligence",     content: <CropIntelligenceCard prediction={{ id: "local", ...intelligence.crop, computedAt: null as never }} /> },
    { key: "yield",      label: "Yield Forecast",        content: <YieldForecastPanel forecast={{ id: "local", ...intelligence.yield, computedAt: null as never }} /> },
    { key: "forecast",   label: "Vegetation Forecast",   content: <VegetationForecastChart forecast={{ id: "local", ...intelligence.forecast, computedAt: null as never }} /> },
    { key: "confidence", label: "Scientific Confidence", content: <ConfidenceGauge model={{ id: "local", ...intelligence.confidence, computedAt: null as never }} /> },
    { key: "benchmark",  label: "Regional Benchmark",    content: <BenchmarkPanel data={{ id: "local", ...intelligence.benchmark, computedAt: null as never }} /> },
  ];

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-3 w-full p-4 text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
          <Brain className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">AI Intelligence</p>
          <p className="text-[11px] text-muted-foreground/50">
            Anomaly · Crop · Yield · Forecast · Confidence · Benchmark
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {panels.map(({ key, label, content }) => (
            <div key={key} className="rounded-xl border border-border bg-background/60 p-4">
              <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
                {label}
              </p>
              {content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
