"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Satellite, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthScoreRing } from "./HealthScoreRing";
import { InsightCard } from "./InsightCard";
import { CarbonScoreCard } from "./CarbonScoreCard";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import {
  computeHealthScore,
  type HealthScore,
} from "@/lib/intelligence/health-scoring";
import { generateInsights } from "@/lib/intelligence/insights-engine";
import type { Insight } from "@/types";
import {
  computeCarbonIntelligence,
  type CarbonIntelligence,
} from "@/lib/intelligence/carbon-intelligence";
import { computeSeasonalBaseline } from "@/lib/intelligence/historical-analytics";
import type { Farm } from "@/types";
import toast from "react-hot-toast";

interface IntelligencePanelProps {
  farm: Farm;
  userId?: string;
}

interface IntelligenceState {
  ndvi: number;
  healthScore: HealthScore;
  insights: Insight[];
  carbon: CarbonIntelligence;
  source: string;
  scannedAt: string;
}

type ScanStatus = "idle" | "scanning" | "done" | "error";

export function IntelligencePanel({ farm, userId }: IntelligencePanelProps) {
  const [intel, setIntel] = useState<IntelligenceState | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [showAllInsights, setShowAllInsights] = useState(false);

  // Compute intelligence on mount (client-side, deterministic)
  useEffect(() => {
    const ndviResult = computeFarmNDVI({
      farmId: farm.id,
      cropType: farm.cropType,
      irrigationType: farm.irrigationType,
      state: farm.state,
      areaHectares: farm.areaHectares,
    });
    const ndvi = ndviResult.current.ndvi;
    const healthScore = computeHealthScore(ndvi);
    const carbon = computeCarbonIntelligence(farm, ndvi);
    const baseline = computeSeasonalBaseline(
      farm.state,
      farm.cropType,
      new Date().getMonth()
    );
    const insights = generateInsights(farm, ndvi, undefined, baseline);

    setIntel({
      ndvi,
      healthScore,
      insights,
      carbon,
      source: "computed",
      scannedAt: ndviResult.computedAt,
    });
  }, [farm]);

  const runScan = async () => {
    if (!userId) {
      toast.error("Authentication required");
      return;
    }
    setScanStatus("scanning");
    try {
      const res = await fetch("/api/intelligence/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId: farm.id, userId }),
      });
      if (!res.ok) throw new Error("Scan failed");
      const data = (await res.json()) as {
        ndvi: number;
        healthScore: HealthScore;
        insights: Insight[];
        carbon: CarbonIntelligence;
        source: string;
        scannedAt: string;
      };

      setIntel({
        ndvi: data.ndvi,
        healthScore: data.healthScore,
        insights: data.insights,
        carbon: data.carbon,
        source: data.source,
        scannedAt: data.scannedAt,
      });
      setScanStatus("done");
      toast.success(`Scan complete — NDVI: ${data.ndvi.toFixed(3)}`);
    } catch {
      setScanStatus("error");
      toast.error("Scan failed. Check network and retry.");
    }
  };

  const visibleInsights =
    intel && !showAllInsights ? intel.insights.slice(0, 3) : intel?.insights ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-green-400" />
            Satellite Intelligence
          </CardTitle>
          <div className="flex items-center gap-2">
            {intel && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] ${
                  intel.source === "sentinel_hub"
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                    : "bg-muted border-border text-muted-foreground/60"
                }`}
              >
                <Satellite className="w-2.5 h-2.5" />
                {intel.source === "sentinel_hub" ? "Sentinel-2" : "Computed"}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={runScan}
              disabled={scanStatus === "scanning"}
              className="h-7 px-2.5 text-xs"
            >
              <RefreshCw
                className={`w-3 h-3 ${scanStatus === "scanning" ? "animate-spin" : ""}`}
              />
              {scanStatus === "scanning" ? "Scanning…" : "Scan Farm"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {intel ? (
          <>
            {/* Health Score + NDVI */}
            <div className="flex items-center gap-6">
              <HealthScoreRing healthScore={intel.healthScore} size={112} />
              <div className="flex-1 space-y-2.5">
                <div>
                  <p className="text-[10px] text-muted-foreground/50 mb-0.5">
                    Current NDVI
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-mono text-foreground">
                      {intel.ndvi.toFixed(3)}
                    </span>
                    <Badge
                      variant={
                        intel.ndvi >= 0.55
                          ? "green"
                          : intel.ndvi >= 0.35
                          ? "yellow"
                          : "red"
                      }
                      size="sm"
                    >
                      {intel.healthScore.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground/50 mb-1">
                    <span>Vegetation Coverage</span>
                    <span>{intel.carbon.vegetationCoverage}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${intel.carbon.vegetationCoverage}%`,
                        background: intel.healthScore.hex,
                      }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                  {intel.healthScore.description}
                </p>
              </div>
            </div>

            {/* Insights */}
            {intel.insights.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-semibold text-foreground">
                    Intelligence Insights
                  </p>
                  <Badge variant="gray" size="sm">
                    {intel.insights.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {visibleInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      compact
                    />
                  ))}
                </div>
                {intel.insights.length > 3 && (
                  <button
                    onClick={() => setShowAllInsights((v) => !v)}
                    className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showAllInsights ? (
                      <>
                        <ChevronUp className="w-3 h-3" /> Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        {intel.insights.length - 3} more insights
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Carbon Intelligence */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2.5">
                Carbon Intelligence
              </p>
              <CarbonScoreCard carbon={intel.carbon} compact />
            </div>

            {intel.scannedAt && (
              <p className="text-[10px] text-muted-foreground/40 text-right">
                Last scan:{" "}
                {new Date(intel.scannedAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 text-muted-foreground/30 animate-spin" />
              <p className="text-sm text-muted-foreground/40">
                Computing intelligence…
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
