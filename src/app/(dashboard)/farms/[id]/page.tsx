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
  User,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Pencil,
  Globe,
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
  status?: "success" | "pending" | "info";
}

function ActivityTimeline({ farm }: { farm: Farm }) {
  const registeredDate = farm.createdAt
    ? formatTimestamp(farm.createdAt)
    : "—";

  const events: TimelineEvent[] = [
    {
      id: "registered",
      icon: CheckCircle2,
      iconColor: "text-green-400",
      iconBg: "bg-green-500/10",
      title: "Farm registered",
      description: `${farm.name} added to the monitoring system`,
      time: registeredDate,
      status: "success",
    },
    {
      id: "boundary",
      icon: farm.boundary ? CheckCircle2 : Clock,
      iconColor: farm.boundary ? "text-blue-400" : "text-muted-foreground/40",
      iconBg: farm.boundary ? "bg-blue-500/10" : "bg-muted",
      title: farm.boundary ? "Boundary mapped" : "Boundary pending",
      description: farm.boundary
        ? `GeoJSON polygon saved — ${farm.areaHectares.toFixed(2)} ha`
        : "Draw the farm boundary to enable satellite analytics",
      time: farm.boundary ? registeredDate : "Action required",
      status: farm.boundary ? "success" : "pending",
    },
    {
      id: "ndvi",
      icon: Leaf,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      title: "NDVI baseline computed",
      description: "Vegetation index estimated from location data",
      time: registeredDate,
      status: "info",
    },
    {
      id: "satellite",
      icon: Satellite,
      iconColor: "text-muted-foreground/40",
      iconBg: "bg-muted",
      title: "Satellite imagery — pending",
      description: "Connect Google Earth Engine to enable real imagery",
      time: "Upcoming",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-0">
      {events.map((ev, i) => {
        const Icon = ev.icon;
        return (
          <div key={ev.id} className="flex gap-3">
            {/* Timeline line */}
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
            {/* Content */}
            <div className={`pb-${i < events.length - 1 ? "4" : "0"} flex-1 min-w-0`}>
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                <span className="text-xs text-muted-foreground/50 shrink-0">{ev.time}</span>
              </div>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">{ev.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Satellite placeholder ─────────────────────────────────────────────────────

function SatellitePlaceholder({ farm }: { farm: Farm }) {
  const bands = [
    { name: "NDVI", desc: "Vegetation index" },
    { name: "NDWI", desc: "Water index" },
    { name: "EVI", desc: "Enhanced vegetation" },
    { name: "SAVI", desc: "Soil-adjusted VI" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-muted-foreground/60" />
            Satellite Intelligence
          </CardTitle>
          <Badge variant="yellow" size="sm">Coming Soon</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="relative rounded-2xl overflow-hidden border border-border"
          style={{ height: 200, background: "linear-gradient(135deg, #040906 0%, #060d08 100%)" }}
        >
          {/* Scanline animation */}
          <div
            className="absolute left-0 right-0 h-px opacity-20"
            style={{
              background: "linear-gradient(90deg, transparent, #4ade80, transparent)",
              animation: "scanline 3s linear infinite",
            }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(74,222,128,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.07) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/15 flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-400/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground/70">
                Awaiting GEE Connection
              </p>
              <p className="text-xs text-muted-foreground/40 mt-0.5">
                {farm.name} · {farm.areaHectares.toFixed(1)} ha
              </p>
            </div>
          </div>
          {/* Corner coords */}
          <div className="absolute bottom-3 right-3 text-[10px] text-green-400/30 font-mono">
            {farm.coordinates.lat.toFixed(4)}°N {farm.coordinates.lng.toFixed(4)}°E
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {bands.map((b) => (
            <div
              key={b.name}
              className="p-3 rounded-xl bg-muted border border-border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{b.name}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full w-0 bg-green-500/40 rounded-full" />
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-1">{b.desc} — no data</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/50">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>
            Connect Google Earth Engine in{" "}
            <Link href="/settings" className="text-green-400/70 hover:text-green-400 transition-colors">
              Settings → Integrations
            </Link>{" "}
            to enable real satellite data.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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

  const grade = carbonResult ? getCarbonScoreGrade(carbonResult.carbonScore) : null;
  const hasBoundary = !!farm.boundary?.coordinates?.[0]?.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Back ─────────────────────────────────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Farms
      </button>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{farm.name}</h1>
            <Badge variant="green" dot>{farm.status}</Badge>
            {hasBoundary && (
              <Badge variant="blue" size="sm">Boundary mapped</Badge>
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

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Ruler, label: "Total Area", value: formatHectares(farm.areaHectares), color: "text-green-400" },
          { icon: Wheat, label: "Crop", value: getCropLabel(farm.cropType), color: "text-emerald-400" },
          { icon: Droplets, label: "Irrigation", value: getIrrigationLabel(farm.irrigationType).split(" ")[0], color: "text-blue-400" },
          { icon: Calendar, label: "Registered", value: formatTimestamp(farm.createdAt), color: "text-muted-foreground" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-2xl border border-border bg-card">
              <Icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className="text-sm font-semibold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground/50">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Map + Carbon Score ────────────────────────────────────────────── */}
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
                  <span>GeoJSON polygon saved · {farm.areaHectares.toFixed(2)} ha mapped</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carbon score */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Carbon Score</CardTitle>
            </CardHeader>
            <CardContent>
              {carbonResult ? (
                <div className="text-center py-2">
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(74,222,128,0.1)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40" fill="none" stroke="#4ade80" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40 * (carbonResult.carbonScore / 100)} ${2 * Math.PI * 40}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">{carbonResult.carbonScore}</span>
                      {grade && (
                        <span className={`text-sm font-semibold ${grade.color}`}>{grade.grade}</span>
                      )}
                    </div>
                  </div>
                  {grade && (
                    <Badge variant="green" className="mb-4">{grade.label}</Badge>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2.5 rounded-xl bg-muted border border-border">
                      <p className="text-[10px] text-muted-foreground/50 mb-0.5">CO₂e Est.</p>
                      <p className="text-sm font-bold text-foreground">{carbonResult.totalCO2eReduction.toFixed(1)} t</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted border border-border">
                      <p className="text-[10px] text-muted-foreground/50 mb-0.5">Credits</p>
                      <p className="text-sm font-bold text-foreground">₹{(carbonResult.projectedAnnualCredits / 100).toFixed(0)}K</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted border border-border col-span-2">
                      <p className="text-[10px] text-muted-foreground/50 mb-0.5">Sustainability</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${carbonResult.sustainabilityIndex * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {(carbonResult.sustainabilityIndex * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground/50 text-sm">No estimation yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
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

      {/* ── Activity + Satellite ─────────────────────────────────────────── */}
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

        <SatellitePlaceholder farm={farm} />
      </div>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      {farm.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Field Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{farm.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-6">
        {[
          { href: "/carbon", icon: BarChart3, label: "Run Carbon Estimation", color: "text-green-400" },
          { href: "/satellite", icon: Satellite, label: "View NDVI Satellite", color: "text-blue-400" },
          { href: "/reports", icon: TrendingUp, label: "Generate Report", color: "text-emerald-400" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}>
              <div className="p-4 rounded-2xl border border-border bg-card hover:bg-card/80 hover:border-green-500/20 cursor-pointer transition-all group flex items-center gap-3">
                <Icon className={`w-4 h-4 ${a.color} shrink-0`} />
                <span className="text-xs font-medium text-foreground">{a.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-auto group-hover:text-muted-foreground/60 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
