"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Wheat,
  Droplets,
  Ruler,
  Calendar,
  BarChart3,
  Satellite,
  Leaf,
  TrendingUp,
} from "lucide-react";
import { getFarm } from "@/lib/firestore";
import {
  generateMockCarbonTimeSeries,
  generateMockNDVITimeSeries,
  estimateCarbon,
} from "@/lib/carbon-estimation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarbonScoreChart, NDVIChart } from "@/components/dashboard/carbon-chart";
import {
  getCropLabel,
  getIrrigationLabel,
  getCarbonScoreGrade,
  getNDVIColor,
  formatTimestamp,
  formatHectares,
} from "@/lib/utils";
import type { Farm, CarbonEstimationResults } from "@/types";
import Link from "next/link";

const FarmMap = dynamic(
  () => import("@/components/maps/farm-map").then((m) => m.FarmMap),
  { ssr: false }
);

export default function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [carbonResult, setCarbonResult] = useState<CarbonEstimationResults | null>(null);
  const carbonData = generateMockCarbonTimeSeries(12);
  const ndviData = generateMockNDVITimeSeries(12);

  useEffect(() => {
    if (!id) return;
    getFarm(id).then((f) => {
      setFarm(f);
      if (f) {
        const result = estimateCarbon({
          cropType: f.cropType,
          areaHectares: f.areaHectares,
          irrigationType: f.irrigationType,
          ndviScore: 0.55 + Math.random() * 0.25,
          vegetationCoverage: 60 + Math.random() * 25,
          soilOrganicCarbon: 1.2,
          fertilizerUseKgPerHa: 80,
          seasonalCycles: 1,
        });
        setCarbonResult(result);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-muted rounded-xl w-48 mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="h-[350px] bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Farm not found</p>
        <Link href="/farms">
          <Button variant="outline">Back to Farms</Button>
        </Link>
      </div>
    );
  }

  const grade = carbonResult
    ? getCarbonScoreGrade(carbonResult.carbonScore)
    : null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Farms
      </button>

      {/* Farm header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">{farm.name}</h1>
            <Badge variant="green" dot>
              {farm.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {farm.location}, {farm.district}, {farm.state}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/satellite">
            <Button variant="outline" size="sm">
              <Satellite className="w-4 h-4" />
              Run NDVI
            </Button>
          </Link>
          <Link href="/carbon">
            <Button variant="primary" size="sm">
              <BarChart3 className="w-4 h-4" />
              Estimate Carbon
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Ruler,
            label: "Total Area",
            value: formatHectares(farm.areaHectares),
            color: "text-green-400",
          },
          {
            icon: Wheat,
            label: "Crop Type",
            value: getCropLabel(farm.cropType),
            color: "text-emerald-400",
          },
          {
            icon: Droplets,
            label: "Irrigation",
            value: getIrrigationLabel(farm.irrigationType).split(" ")[0],
            color: "text-blue-400",
          },
          {
            icon: Calendar,
            label: "Registered",
            value: formatTimestamp(farm.createdAt),
            color: "text-muted-foreground",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-4 rounded-2xl border border-border bg-card"
            >
              <Icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className="text-base font-semibold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground/60">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Farm Location</CardTitle>
            </CardHeader>
            <CardContent>
              <FarmMap
                farms={[farm]}
                center={[farm.coordinates.lat, farm.coordinates.lng]}
                zoom={12}
                height="320px"
              />
            </CardContent>
          </Card>
        </div>

        {/* Carbon score */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Carbon Score</CardTitle>
            </CardHeader>
            <CardContent>
              {carbonResult ? (
                <div className="text-center py-4">
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(74,222,128,0.1)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          2 * Math.PI * 40 * (carbonResult.carbonScore / 100)
                        } ${2 * Math.PI * 40}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">
                        {carbonResult.carbonScore}
                      </span>
                      {grade && (
                        <span className={`text-sm font-semibold ${grade.color}`}>
                          {grade.grade}
                        </span>
                      )}
                    </div>
                  </div>
                  {grade && (
                    <Badge variant="green" className="mb-4">
                      {grade.label}
                    </Badge>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-muted border border-border">
                      <p className="text-xs text-muted-foreground/60 mb-0.5">CO₂e Est.</p>
                      <p className="text-sm font-bold text-foreground">
                        {carbonResult.totalCO2eReduction.toFixed(1)} t
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted border border-border">
                      <p className="text-xs text-muted-foreground/60 mb-0.5">Credits Est.</p>
                      <p className="text-sm font-bold text-foreground">
                        ₹{(carbonResult.projectedAnnualCredits / 100).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground/60">
                  No estimation yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Carbon Score Trend</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <CarbonScoreChart data={carbonData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>NDVI Analytics</CardTitle>
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: getNDVIColor(ndviData[ndviData.length - 1]?.ndvi ?? 0.5) }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <NDVIChart data={ndviData} />
            <div className="mt-3 flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-muted-foreground">
                Current NDVI:{" "}
                <span className="text-foreground font-medium">
                  {ndviData[ndviData.length - 1]?.ndvi?.toFixed(3)}
                </span>{" "}
                — Healthy vegetation
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {farm.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{farm.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
