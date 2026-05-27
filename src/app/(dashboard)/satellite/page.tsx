"use client";

import { useState } from "react";
import {
  Layers,
  TrendingUp,
  Droplets,
  Sun,
  Cloud,
  Eye,
  RefreshCw,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NDVIChart, CarbonBreakdownChart } from "@/components/dashboard/carbon-chart";
import {
  generateMockNDVITimeSeries,
  generateMockCarbonTimeSeries,
} from "@/lib/carbon-estimation";
import { getNDVIColor, getNDVILabel, getNDVIStatus } from "@/lib/utils";

const NDVI_BANDS = [
  { label: "NDVI", description: "Vegetation index", active: true },
  { label: "NDWI", description: "Water index", active: false },
  { label: "EVI", description: "Enhanced vegetation", active: false },
  { label: "SAVI", description: "Soil-adjusted", active: false },
];

const MOCK_FARMS = [
  { name: "Rampur Agricultural Plot", ndvi: 0.71, coverage: 85, moisture: 0.62 },
  { name: "Punjab Wheat Field", ndvi: 0.58, coverage: 72, moisture: 0.55 },
  { name: "Maharashtra Cotton", ndvi: 0.43, coverage: 60, moisture: 0.41 },
  { name: "Krishnanagar Farm", ndvi: 0.82, coverage: 91, moisture: 0.75 },
];

function NDVIBar({ value }: { value: number }) {
  const color = getNDVIColor(value);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono text-foreground w-12 text-right">
        {value.toFixed(3)}
      </span>
    </div>
  );
}

function NDVIColorScale() {
  const stops = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  return (
    <div className="flex gap-0.5">
      {stops.map((v) => (
        <div
          key={v}
          className="flex-1 h-3 rounded-sm"
          style={{ background: getNDVIColor(v) }}
          title={`NDVI: ${v.toFixed(1)}`}
        />
      ))}
    </div>
  );
}

export default function SatellitePage() {
  const [selectedBand, setSelectedBand] = useState("NDVI");
  const [refreshing, setRefreshing] = useState(false);
  const ndviData = generateMockNDVITimeSeries(12);
  const carbonData = generateMockCarbonTimeSeries(6);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Satellite Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sentinel-2 · Last updated 4h ago
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Badge variant="green" dot>
            Live
          </Badge>
        </div>
      </div>

      {/* Band selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {NDVI_BANDS.map((band) => (
          <button
            key={band.label}
            onClick={() => setSelectedBand(band.label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              selectedBand === band.label
                ? "bg-green-500/12 border-green-500/30 text-green-300"
                : "bg-card border-border text-muted-foreground hover:border-green-500/20 hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {band.label}
            <span className="text-xs opacity-60">— {band.description}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Satellite viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Satellite Imagery Viewer</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="blue">Sentinel-2</Badge>
                  <Badge variant="green">10m res.</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Placeholder satellite image */}
              <div className="relative h-[340px] rounded-2xl overflow-hidden bg-card border border-border">
                {/* Simulated NDVI visualization */}
                <div className="absolute inset-0">
                  <div
                    className="w-full h-full opacity-20"
                    style={{
                      background: `
                        radial-gradient(ellipse at 30% 40%, rgba(74,222,128,0.8) 0%, transparent 35%),
                        radial-gradient(ellipse at 65% 35%, rgba(34,197,94,0.6) 0%, transparent 30%),
                        radial-gradient(ellipse at 50% 70%, rgba(22,163,74,0.7) 0%, transparent 40%),
                        radial-gradient(ellipse at 20% 70%, rgba(74,222,128,0.4) 0%, transparent 25%),
                        radial-gradient(ellipse at 80% 60%, rgba(251,191,36,0.5) 0%, transparent 25%)
                      `,
                    }}
                  />
                  {/* Grid overlay */}
                  <div className="absolute inset-0 grid-pattern opacity-20" />
                </div>

                {/* Scan line effect */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400/30 to-transparent scanline top-0" />

                {/* Legend */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">{selectedBand} Scale</p>
                      <p className="text-xs text-muted-foreground/60">
                        Cloud cover: 3%
                      </p>
                    </div>
                    <NDVIColorScale />
                    <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1">
                      <span>0.0 (Bare/Water)</span>
                      <span>0.5 (Moderate)</span>
                      <span>1.0 (Dense)</span>
                    </div>
                  </div>
                </div>

                {/* GEE badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/60">
                      GEE integration ready
                    </span>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="absolute top-3 left-3">
                  <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl px-3 py-1.5">
                    <span className="text-xs font-mono text-muted-foreground">
                      20.5937°N, 78.9629°E
                    </span>
                  </div>
                </div>
              </div>

              {/* Time selector */}
              <div className="flex gap-2 mt-3">
                {["Today", "7d", "30d", "3mo", "Season"].map((t) => (
                  <button
                    key={t}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      t === "30d"
                        ? "bg-green-500/12 border border-green-500/25 text-green-300"
                        : "text-muted-foreground/60 hover:text-foreground border border-transparent hover:border-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics sidebar */}
        <div className="flex flex-col gap-4">
          {/* Summary cards */}
          {[
            {
              icon: Eye,
              label: "Mean NDVI",
              value: "0.634",
              status: "Healthy",
              color: "text-green-400",
              bg: "bg-green-500/8",
            },
            {
              icon: Droplets,
              label: "Moisture Index",
              value: "0.58",
              status: "Good",
              color: "text-blue-400",
              bg: "bg-blue-500/8",
            },
            {
              icon: Sun,
              label: "Vegetation Cover",
              value: "78%",
              status: "Above Avg",
              color: "text-yellow-400",
              bg: "bg-yellow-500/8",
            },
            {
              icon: Cloud,
              label: "Cloud Coverage",
              value: "3%",
              status: "Clear",
              color: "text-muted-foreground",
              bg: "bg-muted",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground/60">{item.label}</p>
                  <p className="text-base font-bold text-foreground">{item.value}</p>
                </div>
                <Badge variant="green" size="sm">
                  {item.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farm NDVI comparison */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Farm NDVI Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {MOCK_FARMS.map((farm) => {
                const status = getNDVIStatus(farm.ndvi);
                return (
                  <motion.div
                    key={farm.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground font-medium truncate max-w-[200px]">
                        {farm.name}
                      </span>
                      <Badge
                        variant={farm.ndvi >= 0.6 ? "green" : farm.ndvi >= 0.4 ? "yellow" : "red"}
                        size="sm"
                      >
                        {getNDVILabel(status)}
                      </Badge>
                    </div>
                    <NDVIBar value={farm.ndvi} />
                    <div className="flex gap-3 text-[10px] text-muted-foreground/50">
                      <span>Coverage: {farm.coverage}%</span>
                      <span>Moisture: {farm.moisture.toFixed(2)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NDVI Time Series</CardTitle>
          </CardHeader>
          <CardContent>
            <NDVIChart data={ndviData} />
            <div className="mt-4">
              <p className="text-xs text-muted-foreground/60 mb-2">
                Seasonal biomass trend
              </p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500/50 via-green-500 to-emerald-500"
                  style={{ width: "72%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1">
                <span>Kharif season start</span>
                <span>72% progression</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crop growth trend */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Seasonal Carbon-NDVI Correlation</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <CarbonBreakdownChart
            data={carbonData.map((d) => ({
              name: d.month,
              value: d.co2eReduction,
            }))}
            className="h-[200px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
