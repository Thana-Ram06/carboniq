"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Map,
  Leaf,
  BarChart3,
  Activity,
  TrendingUp,
  Satellite,
  Users,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getDashboardStats } from "@/lib/firestore";
import {
  generateMockCarbonTimeSeries,
  generateMockNDVITimeSeries,
} from "@/lib/carbon-estimation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CarbonScoreChart, NDVIChart } from "@/components/dashboard/carbon-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@/types";
import { formatHectares, formatCO2 } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FarmMap = dynamic(
  () => import("@/components/maps/farm-map").then((m) => m.FarmMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="h-[260px] rounded-2xl border border-border bg-muted/50 flex items-center justify-center">
      <div className="text-center">
        <Satellite className="w-7 h-7 text-green-500/25 mx-auto mb-2 animate-pulse" />
        <p className="text-xs text-muted-foreground/60">Loading map...</p>
      </div>
    </div>
  );
}

function TimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const carbonData = generateMockCarbonTimeSeries(12);
  const ndviData = generateMockNDVITimeSeries(12);

  useEffect(() => {
    if (!user) return;
    getDashboardStats(user.uid).then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, [user]);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            <TimeOfDay />, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s your carbon intelligence overview
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/farms">
            <Button variant="outline" size="sm">
              <Map className="w-3.5 h-3.5" />
              Add Farm
            </Button>
          </Link>
          <Link href="/satellite">
            <Button variant="primary" size="sm">
              <Satellite className="w-3.5 h-3.5" />
              Run Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Total Farms"
          value={loading ? "—" : (stats?.totalFarms ?? 0)}
          icon={Map}
          color="green"
          change={12}
          changeLabel="vs last month"
          index={0}
        />
        <StatsCard
          title="Area Monitored"
          value={loading ? "—" : formatHectares(stats?.totalAreaHectares ?? 0)}
          icon={Activity}
          color="emerald"
          change={8}
          index={1}
        />
        <StatsCard
          title="Carbon Score"
          value={loading ? "—" : (stats?.averageCarbonScore ?? 0)}
          unit="/100"
          icon={BarChart3}
          color="teal"
          change={5}
          index={2}
        />
        <StatsCard
          title="Est. CO₂e Reduction"
          value={loading ? "—" : formatCO2(stats?.totalCO2eReduction ?? 0)}
          icon={Leaf}
          color="green"
          description="Annual estimate"
          index={3}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Active Farms"
          value={loading ? "—" : (stats?.activeFarms ?? 0)}
          icon={Users}
          color="blue"
          index={4}
        />
        <StatsCard
          title="Avg NDVI"
          value={loading ? "—" : (stats?.averageNDVI ?? 0).toFixed(3)}
          icon={TrendingUp}
          color="green"
          index={5}
        />
        <StatsCard
          title="Crop Health"
          value={loading ? "—" : `${Math.round((stats?.cropHealthIndex ?? 0) * 100)}%`}
          icon={Leaf}
          color="emerald"
          change={3}
          index={6}
        />
        <StatsCard
          title="Credits Est."
          value={loading ? "—" : `₹${((stats?.estimatedCarbonCredits ?? 0) / 100).toFixed(0)}K`}
          icon={BarChart3}
          color="yellow"
          description="At ~₹1,500/tCO₂e"
          index={7}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Carbon Score & CO₂e Trend</CardTitle>
                <Badge variant="green" dot>12 months</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CarbonScoreChart data={carbonData} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map + NDVI row */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Farm Locations</CardTitle>
                <Link href="/farms">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-green-400 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <FarmMap height="260px" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>NDVI Trend</CardTitle>
                <Badge variant="green" dot size="sm">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <NDVIChart data={ndviData} className="h-[200px]" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/60 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className="text-base font-bold text-foreground tabular-nums">
                    {ndviData[ndviData.length - 1]?.ndvi?.toFixed(3) ?? "—"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/60 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="green" dot size="sm">Healthy</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
