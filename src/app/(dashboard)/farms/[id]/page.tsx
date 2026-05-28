"use client";

import { useEffect, useMemo, useState } from "react";
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
  User,
  Layers,
  Activity,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Cloud,
  Shield,
} from "lucide-react";
import { getFarm } from "@/lib/firestore";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import {
  computeHealthScore,
  healthColorClass,
} from "@/lib/intelligence/health-scoring";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarbonScoreChart, NDVIChart } from "@/components/dashboard/carbon-chart";
import { IntelligencePanel } from "@/components/intelligence/IntelligencePanel";
import {
  getCropLabel,
  getIrrigationLabel,
  getNDVIColor,
  formatTimestamp,
  formatHectares,
} from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { WeatherWidget } from "@/components/monitoring/WeatherWidget";
import { RiskAlertCard, RiskScoreBadge } from "@/components/monitoring/RiskAlertCard";
import { assessRisk, riskSeverityColor } from "@/lib/monitoring/risk-engine";
import type { RiskAssessment } from "@/lib/monitoring/risk-engine";
import type { Farm } from "@/types";
import Link from "next/link";

const FarmMap = dynamic(
  () => import("@/components/maps/farm-map").then((m) => m.FarmMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] rounded-2xl bg-card border border-border animate-pulse" />
    ),
  }
);

// ── Activity timeline ─────────────────────────────────────────────────────────

interface TimelineEvent {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
}

function ActivityTimeline({ farm }: { farm: Farm }) {
  const registeredDate = farm.createdAt ? formatTimestamp(farm.createdAt) : "—";

  const events: TimelineEvent[] = [
    {
      id: "registered",
      icon: CheckCircle2,
      iconColor: "text-green-400",
      iconBg: "bg-green-500/10",
      title: "Farm registered",
      description: `${farm.name} added to the VASUDHA monitoring system`,
      time: registeredDate,
    },
    {
      id: "boundary",
      icon: farm.boundary ? CheckCircle2 : Layers,
      iconColor: farm.boundary ? "text-blue-400" : "text-muted-foreground/40",
      iconBg: farm.boundary ? "bg-blue-500/10" : "bg-muted",
      title: farm.boundary ? "Boundary mapped" : "Boundary pending",
      description: farm.boundary
        ? `GeoJSON polygon saved — ${farm.areaHectares.toFixed(2)} ha`
        : "Draw the farm boundary to enable satellite analytics",
      time: farm.boundary ? registeredDate : "Action required",
    },
    {
      id: "ndvi",
      icon: Leaf,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      title: "NDVI intelligence active",
      description:
        "Vegetation index computed from crop phenology and climate zone data",
      time: registeredDate,
    },
    {
      id: "intelligence",
      icon: Activity,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
      title: "Intelligence engine running",
      description:
        "Health scoring, insights, and carbon estimation available",
      time: "Live",
    },
  ];

  return (
    <div className="space-y-0">
      {events.map((ev, i) => {
        const Icon = ev.icon;
        return (
          <div key={ev.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-xl ${ev.iconBg} border border-border flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-3.5 h-3.5 ${ev.iconColor}`} />
              </div>
              {i < events.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[20px]" />
              )}
            </div>
            <div className="pb-4 flex-1 min-w-0 last:pb-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-sm font-medium text-foreground truncate">
                  {ev.title}
                </p>
                <span className="text-xs text-muted-foreground/50 shrink-0">
                  {ev.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                {ev.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getFarm(id).then((f) => {
      setFarm(f);
      setLoading(false);
    });
  }, [id]);

  // Compute real NDVI + derived intelligence from crop/irrigation/state data
  const ndviResult = useMemo(() => {
    if (!farm) return null;
    return computeFarmNDVI({
      farmId: farm.id,
      cropType: farm.cropType,
      irrigationType: farm.irrigationType,
      state: farm.state,
      areaHectares: farm.areaHectares,
    });
  }, [farm]);

  const ndvi = ndviResult?.current.ndvi ?? 0.5;

  const healthScore = useMemo(
    () => computeHealthScore(ndvi),
    [ndvi]
  );

  const carbon = useMemo(
    () => (farm ? computeCarbonIntelligence(farm, ndvi) : null),
    [farm, ndvi]
  );

  const riskAssessment = useMemo<RiskAssessment | null>(
    () => (farm ? assessRisk(farm, ndvi, null) : null),
    [farm, ndvi]
  );

  // Real NDVI chart data from phenology time series
  const ndviChartData = useMemo(() => {
    if (!ndviResult) return [];
    return ndviResult.timeSeries.map((pt) => ({
      month: pt.month,
      ndvi: pt.ndvi,
      biomass: parseFloat((pt.ndvi * 8.4).toFixed(2)),
    }));
  }, [ndviResult]);

  // Real carbon trend derived from NDVI time series
  const carbonChartData = useMemo(() => {
    if (!ndviResult || !farm) return [];
    return ndviResult.timeSeries.map((pt) => {
      const c = computeCarbonIntelligence(farm, pt.ndvi);
      return {
        month: pt.month,
        carbonScore: c.sustainabilityIndex,
        co2eReduction: c.carbonScoreTonnes,
      };
    });
  }, [ndviResult, farm]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-card rounded-xl w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[360px] bg-card rounded-2xl" />
          <div className="h-[360px] bg-card rounded-2xl" />
        </div>
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

  const hasBoundary = !!farm.boundary?.coordinates?.[0]?.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Back ───────────────────────────────────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Farms
      </button>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">
              {farm.name}
            </h1>
            <Badge variant="green" dot>
              {farm.status}
            </Badge>
            {hasBoundary && (
              <Badge variant="blue" size="sm">
                Boundary mapped
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {farm.location}, {farm.district}, {farm.state}
            </p>
          </div>
          {farm.farmerName && (
            <div className="flex items-center gap-1.5 mt-1">
              <User className="w-3.5 h-3.5 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{farm.farmerName}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/satellite">
            <Button variant="outline" size="sm">
              <Satellite className="w-4 h-4" />
              NDVI Map
            </Button>
          </Link>
          <Link href="/carbon">
            <Button variant="primary" size="sm">
              <BarChart3 className="w-4 h-4" />
              Carbon Report
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: Ruler,
            label: "Total Area",
            value: formatHectares(farm.areaHectares),
            color: "text-green-400",
          },
          {
            icon: Wheat,
            label: "Crop",
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
              <p className="text-sm font-semibold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground/50">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Map + Carbon Score ──────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground/60" />
                  {hasBoundary ? "Farm Boundary Map" : "Farm Location"}
                </CardTitle>
                {!hasBoundary && (
                  <Link href="/farms">
                    <button className="text-xs text-green-400/70 hover:text-green-400 flex items-center gap-1 transition-colors">
                      <Pencil className="w-3 h-3" />
                      Add boundary
                    </button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <FarmMap
                farms={[farm]}
                center={[farm.coordinates.lat, farm.coordinates.lng]}
                zoom={hasBoundary ? 13 : 12}
                height="320px"
              />
              {hasBoundary && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span>
                    GeoJSON polygon saved · {farm.areaHectares.toFixed(2)} ha
                    mapped
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real Carbon Score from Intelligence Engine */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Carbon Score</CardTitle>
            </CardHeader>
            <CardContent>
              {carbon ? (
                <div className="text-center py-2">
                  {/* Sustainability ring */}
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
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
                        stroke={healthScore.hex}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          2 * Math.PI * 40 * (carbon.sustainabilityIndex / 100)
                        } ${2 * Math.PI * 40}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">
                        {carbon.sustainabilityIndex}
                      </span>
                      <span
                        className={`text-sm font-semibold ${healthColorClass(healthScore.color)}`}
                      >
                        {healthScore.label}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      healthScore.score >= 70
                        ? "green"
                        : healthScore.score >= 45
                        ? "yellow"
                        : "red"
                    }
                    className="mb-4"
                  >
                    {healthScore.description.split(" ").slice(0, 3).join(" ")}
                  </Badge>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2.5 rounded-xl bg-muted border border-border">
                      <p className="text-[10px] text-muted-foreground/50 mb-0.5">
                        CO₂e Est.
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {carbon.carbonScoreTonnes.toFixed(1)} t
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted border border-border">
                      <p className="text-[10px] text-muted-foreground/50 mb-0.5">
                        Credits
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        ${carbon.carbonCreditEstimate.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted border border-border col-span-2">
                      <p className="text-[10px] text-muted-foreground/50 mb-0.5">
                        NDVI Index
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.max(4, ndvi * 100)}%`,
                              background: getNDVIColor(ndvi),
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-foreground">
                          {ndvi.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground/50 text-sm">
                  Loading…
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Carbon Sustainability Trend</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <CarbonScoreChart data={carbonChartData} />
            <p className="mt-2 text-[10px] text-muted-foreground/40">
              Derived from crop phenology NDVI · VASUDHA Carbon Engine v1
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>NDVI Vegetation Timeline</CardTitle>
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: getNDVIColor(ndvi) }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <NDVIChart data={ndviChartData} />
            <div className="mt-3 flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-muted-foreground">
                Current NDVI:{" "}
                <span className="text-foreground font-medium">
                  {ndvi.toFixed(3)}
                </span>{" "}
                ·{" "}
                <span className={healthColorClass(healthScore.color)}>
                  {healthScore.label}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Weather + Risk Intelligence ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              Weather Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherWidget
              lat={farm.coordinates.lat}
              lng={farm.coordinates.lng}
              farmId={farm.id}
              userId={user?.uid}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground/60" />
                Risk Assessment
              </CardTitle>
              {riskAssessment && (
                <RiskScoreBadge
                  score={riskAssessment.overallRisk}
                  severity={riskAssessment.severity}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {riskAssessment ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Drought", value: riskAssessment.droughtRisk },
                    { label: "Heat Stress", value: riskAssessment.heatStressRisk },
                    { label: "Vegetation", value: riskAssessment.vegetationDeclineRisk },
                    { label: "Irrigation", value: riskAssessment.irrigationStressRisk },
                  ].map((r) => (
                    <div key={r.label} className="p-2.5 rounded-xl bg-muted border border-border">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground/60">{r.label}</span>
                        <span className="font-mono text-foreground">{r.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.value}%`,
                            background: riskSeverityColor(
                              r.value >= 75 ? "critical" :
                              r.value >= 50 ? "high" :
                              r.value >= 25 ? "medium" : "low"
                            ),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {riskAssessment.alerts.length > 0 ? (
                  <div className="space-y-2">
                    {riskAssessment.alerts.slice(0, 3).map((alert) => (
                      <RiskAlertCard key={alert.id} alert={alert} compact />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-green-400/80 py-1">
                    <Shield className="w-3.5 h-3.5" />
                    No active risk alerts detected
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground/50 text-sm">
                Computing risk assessment…
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Activity + Intelligence Panel ──────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground/60" />
                Activity Timeline
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityTimeline farm={farm} />
          </CardContent>
        </Card>

        <IntelligencePanel farm={farm} userId={user?.uid} />
      </div>

      {/* ── Notes ──────────────────────────────────────────────────────────── */}
      {farm.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Field Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {farm.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Quick actions ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-6">
        {[
          {
            href: "/carbon",
            icon: BarChart3,
            label: "Run Carbon Estimation",
            color: "text-green-400",
          },
          {
            href: "/satellite",
            icon: Satellite,
            label: "View NDVI Satellite",
            color: "text-blue-400",
          },
          {
            href: "/reports",
            icon: TrendingUp,
            label: "Generate Report",
            color: "text-emerald-400",
          },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}>
              <div className="p-4 rounded-2xl border border-border bg-card hover:bg-card/80 hover:border-green-500/20 cursor-pointer transition-all group flex items-center gap-3">
                <Icon className={`w-4 h-4 ${a.color} shrink-0`} />
                <span className="text-xs font-medium text-foreground">
                  {a.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-auto group-hover:text-muted-foreground/60 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
