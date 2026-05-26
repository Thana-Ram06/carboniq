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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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
    <div className="h-[280px] rounded-2xl border border-border bg-card flex items-center justify-center">
      <div className="text-center">
        <Satellite className="w-8 h-8 text-green-500/30 mx-auto mb-2 animate-pulse" />
        <p className="text-xs text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
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
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s your carbon intelligence overview
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/farms">
            <Button variant="outline" size="sm">
              <Map className="w-4 h-4" />
              Add Farm
            </Button>
          </Link>
          <Link href="/satellite">
            <Button variant="primary" size="sm">
              <Satellite className="w-4 h-4" />
              Run Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Farms"
          value={loading ? "—" : stats?.totalFarms ?? 0}
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
          title="Avg Carbon Score"
          value={loading ? "—" : stats?.averageCarbonScore ?? 0}
          unit="/100"
          icon={BarChart3}
          color="teal"
          change={5}
          index={2}
        />
        <StatsCard
          title="Est. CO₂e Reduction"
          value={
            loading ? "—" : formatCO2(stats?.totalCO2eReduction ?? 0)
          }
          icon={Leaf}
          color="green"
          description="Annual estimate"
          index={3}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Active Farms"
          value={loading ? "—" : stats?.activeFarms ?? 0}
          icon={Users}
          color="blue"
          index={4}
        />
        <StatsCard
          title="Avg NDVI"
          value={
            loading
              ? "—"
              : (stats?.averageNDVI ?? 0).toFixed(3)
          }
          icon={TrendingUp}
          color="green"
          index={5}
        />
        <StatsCard
          title="Crop Health Index"
          value={
            loading
              ? "—"
              : `${Math.round((stats?.cropHealthIndex ?? 0) * 100)}%`
          }
          icon={Leaf}
          color="emerald"
          change={3}
          index={6}
        />
        <StatsCard
          title="Carbon Credits Est."
          value={
            loading
              ? "—"
              : `₹${((stats?.estimatedCarbonCredits ?? 0) / 100).toFixed(0)}K`
          }
          icon={BarChart3}
          color="yellow"
          description="At ~₹1,500/tCO₂e"
          index={7}
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Carbon score chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Carbon Score & CO₂e Trend</CardTitle>
                <Badge variant="green" dot>
                  12 months
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CarbonScoreChart data={carbonData} />
            </CardContent>
          </Card>
        </div>

        {/* Activity feed */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Farm Locations</CardTitle>
                <Link href="/farms">
                  <Badge variant="outline" className="cursor-pointer hover:border-green-500/30">
                    View All →
                  </Badge>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <FarmMap height="280px" />
            </CardContent>
          </Card>
        </div>

        {/* NDVI chart */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>NDVI Trend</CardTitle>
                <Badge variant="green" dot>
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <NDVIChart data={ndviData} className="h-[240px]" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Current NDVI</p>
                  <p className="text-lg font-bold text-foreground">
                    {ndviData[ndviData.length - 1]?.ndvi?.toFixed(3) ?? "—"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="green" dot size="sm">
                    Healthy
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
