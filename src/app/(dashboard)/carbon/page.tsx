"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart3,
  Leaf,
  Droplets,
  TrendingUp,
  Award,
  AlertCircle,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CarbonBreakdownChart } from "@/components/dashboard/carbon-chart";
import { estimateCarbon } from "@/lib/carbon-estimation";
import {
  getCarbonScoreGrade,
  getSustainabilityColor,
  formatCO2,
} from "@/lib/utils";
import type { CarbonEstimationResults, CropType, IrrigationType } from "@/types";

const estimationSchema = z.object({
  cropType: z.string().min(1, "Select crop type"),
  areaHectares: z.coerce.number().min(0.1, "Min 0.1 ha"),
  irrigationType: z.string().min(1, "Select irrigation"),
  ndviScore: z.coerce.number().min(0).max(1),
  vegetationCoverage: z.coerce.number().min(0).max(100),
  soilOrganicCarbon: z.coerce.number().min(0).max(10).default(1.2),
  fertilizerUseKgPerHa: z.coerce.number().min(0).default(80),
  seasonalCycles: z.coerce.number().min(1).max(4).default(1),
});

type EstimationFormData = z.infer<typeof estimationSchema>;

const CROP_OPTIONS = [
  { value: "rice", label: "Rice" },
  { value: "wheat", label: "Wheat" },
  { value: "sugarcane", label: "Sugarcane" },
  { value: "cotton", label: "Cotton" },
  { value: "maize", label: "Maize" },
  { value: "soybean", label: "Soybean" },
  { value: "groundnut", label: "Groundnut" },
  { value: "mustard", label: "Mustard" },
  { value: "other", label: "Other" },
];

const IRRIGATION_OPTIONS = [
  { value: "drip", label: "Drip Irrigation" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "flood", label: "Flood Irrigation" },
  { value: "rainfed", label: "Rainfed" },
  { value: "canal", label: "Canal" },
  { value: "borewell", label: "Borewell" },
];

function ScoreRing({
  score,
  size = 120,
}: {
  score: number;
  size?: number;
}) {
  const r = size * 0.4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const grade = getCarbonScoreGrade(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(74,222,128,0.08)"
          strokeWidth={size * 0.075}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#4ade80"
          strokeWidth={size * 0.075}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground leading-none">
          {score}
        </span>
        <span className={`text-sm font-bold ${grade.color}`}>
          {grade.grade}
        </span>
      </div>
    </div>
  );
}

export default function CarbonPage() {
  const [result, setResult] = useState<CarbonEstimationResults | null>(null);
  const [calculating, setCalculating] = useState(false);

  const form = useForm<EstimationFormData>({
    resolver: zodResolver(estimationSchema),
    defaultValues: {
      ndviScore: 0.55,
      vegetationCoverage: 70,
      soilOrganicCarbon: 1.2,
      fertilizerUseKgPerHa: 80,
      seasonalCycles: 1,
    },
  });

  const handleCalculate = async (data: EstimationFormData) => {
    setCalculating(true);
    await new Promise((r) => setTimeout(r, 800));
    const r = estimateCarbon({
      cropType: data.cropType as CropType,
      areaHectares: data.areaHectares,
      irrigationType: data.irrigationType as IrrigationType,
      ndviScore: data.ndviScore,
      vegetationCoverage: data.vegetationCoverage,
      soilOrganicCarbon: data.soilOrganicCarbon,
      fertilizerUseKgPerHa: data.fertilizerUseKgPerHa,
      seasonalCycles: data.seasonalCycles,
    });
    setResult(r);
    setCalculating(false);
  };

  const grade = result ? getCarbonScoreGrade(result.carbonScore) : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Carbon Estimation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            IPCC Tier 1 methodology · India-specific factors
          </p>
        </div>
        {result && (
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Estimation form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Estimation Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(handleCalculate)}
                className="flex flex-col gap-4"
              >
                <Select
                  label="Crop Type"
                  options={CROP_OPTIONS}
                  placeholder="Select crop"
                  error={form.formState.errors.cropType?.message}
                  {...form.register("cropType")}
                />
                <Input
                  label="Farm Area (Hectares)"
                  type="number"
                  step="0.1"
                  placeholder="12.5"
                  error={form.formState.errors.areaHectares?.message}
                  {...form.register("areaHectares")}
                />
                <Select
                  label="Irrigation Type"
                  options={IRRIGATION_OPTIONS}
                  placeholder="Select irrigation"
                  error={form.formState.errors.irrigationType?.message}
                  {...form.register("irrigationType")}
                />

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Satellite Inputs
                  </p>
                  <div className="flex flex-col gap-3">
                    <Input
                      label="NDVI Score (0–1)"
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      placeholder="0.550"
                      hint="From satellite analysis"
                      {...form.register("ndviScore")}
                    />
                    <Input
                      label="Vegetation Coverage (%)"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="70"
                      {...form.register("vegetationCoverage")}
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Soil & Agronomics
                  </p>
                  <div className="flex flex-col gap-3">
                    <Input
                      label="Soil Organic Carbon (%)"
                      type="number"
                      step="0.1"
                      placeholder="1.2"
                      {...form.register("soilOrganicCarbon")}
                    />
                    <Input
                      label="Fertilizer Use (kg/ha)"
                      type="number"
                      placeholder="80"
                      {...form.register("fertilizerUseKgPerHa")}
                    />
                    <Input
                      label="Seasonal Cycles / Year"
                      type="number"
                      min="1"
                      max="4"
                      placeholder="1"
                      {...form.register("seasonalCycles")}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-1"
                  loading={calculating}
                >
                  <BarChart3 className="w-4 h-4" />
                  {calculating ? "Calculating..." : "Calculate Carbon Score"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Methodology note */}
          <div className="mt-4 p-4 rounded-2xl border border-border bg-card flex gap-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              This is an estimation MVP using IPCC Tier 1 methodology. Results
              are indicative only and not suitable for compliance reporting
              without independent verification.
            </p>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!result && !calculating ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-green-500/8 border border-green-500/15 flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-green-400/60" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Enter parameters to estimate
                </h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs">
                  Fill in the farm details and satellite data to calculate the
                  carbon score and CO₂e reduction estimate.
                </p>
              </motion.div>
            ) : calculating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-20 text-center gap-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center animate-pulse">
                  <BarChart3 className="w-7 h-7 text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Running IPCC Tier 1 estimation...
                </p>
              </motion.div>
            ) : (
              result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  {/* Main score card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <ScoreRing score={result.carbonScore} size={120} />
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                            <h2 className="text-xl font-bold text-foreground">
                              Carbon Score
                            </h2>
                            {grade && (
                              <Badge variant="green">{grade.label}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Methodology: IPCC Tier 1 · India Agriculture
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-muted border border-border text-left">
                              <p className="text-xs text-muted-foreground/60 mb-1">
                                Est. CO₂e Reduction
                              </p>
                              <p className="text-lg font-bold text-foreground">
                                {formatCO2(result.totalCO2eReduction)}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-muted border border-border text-left">
                              <p className="text-xs text-muted-foreground/60 mb-1">
                                Carbon Credits Est.
                              </p>
                              <p className="text-lg font-bold text-foreground">
                                ₹
                                {(
                                  result.projectedAnnualCredits / 100
                                ).toFixed(1)}
                                K
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-muted border border-border text-left">
                              <p className="text-xs text-muted-foreground/60 mb-1">
                                Est. Biomass
                              </p>
                              <p className="text-lg font-bold text-foreground">
                                {result.estimatedBiomass.toFixed(1)} t
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-muted border border-border text-left">
                              <p className="text-xs text-muted-foreground/60 mb-1">
                                Confidence
                              </p>
                              <Badge
                                variant={
                                  result.confidence === "high"
                                    ? "green"
                                    : result.confidence === "medium"
                                    ? "yellow"
                                    : "gray"
                                }
                              >
                                {result.confidence}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sustainability index */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">
                            Sustainability Index
                          </p>
                          <p className="text-sm font-bold" style={{ color: getSustainabilityColor(result.sustainabilityIndex) }}>
                            {(result.sustainabilityIndex * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${result.sustainabilityIndex * 100}%`,
                              background: getSustainabilityColor(result.sustainabilityIndex),
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Breakdown chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Carbon Breakdown (tCO₂e)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CarbonBreakdownChart
                        data={[
                          { name: "Biomass", value: result.breakdown.biomassCarbon },
                          { name: "Soil", value: result.breakdown.soilCarbon },
                          { name: "Reduced Em.", value: result.breakdown.reducedEmissions },
                          { name: "Water", value: result.breakdown.waterConservation },
                        ]}
                      />
                    </CardContent>
                  </Card>

                  {/* Detailed metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            icon: Leaf,
                            label: "Soil Carbon Seq.",
                            value: `${result.soilCarbonSequestration.toFixed(2)} t`,
                            color: "text-green-400",
                          },
                          {
                            icon: TrendingUp,
                            label: "Emission Factor",
                            value: result.emissionReductionFactor.toFixed(3),
                            color: "text-emerald-400",
                          },
                          {
                            icon: Droplets,
                            label: "Water Conservation",
                            value: `${result.breakdown.waterConservation.toFixed(2)} ha·m`,
                            color: "text-blue-400",
                          },
                          {
                            icon: Award,
                            label: "Annual Credits",
                            value: `₹${(result.projectedAnnualCredits / 100).toFixed(1)}K`,
                            color: "text-yellow-400",
                          },
                        ].map((m) => {
                          const Icon = m.icon;
                          return (
                            <div
                              key={m.label}
                              className="p-3 rounded-xl bg-muted border border-border"
                            >
                              <Icon className={`w-4 h-4 ${m.color} mb-1.5`} />
                              <p className="text-sm font-bold text-foreground">
                                {m.value}
                              </p>
                              <p className="text-xs text-muted-foreground/60 mt-0.5">
                                {m.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
