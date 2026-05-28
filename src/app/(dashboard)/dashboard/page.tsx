"use client";

import { useMemo } from "react";
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
  Brain,
  ShieldAlert,
  Zap,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFarms } from "@/hooks/use-farms";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CarbonScoreChart, NDVIChart } from "@/components/dashboard/carbon-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MonitoringStatus } from "@/components/monitoring/MonitoringStatus";
import { RiskScoreBadge } from "@/components/monitoring/RiskAlertCard";
import { AlertStrip } from "@/components/monitoring/AlertStrip";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { computeHealthScore } from "@/lib/intelligence/health-scoring";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { assessRisk } from "@/lib/monitoring/risk-engine";
import { riskSeverityColor } from "@/lib/monitoring/risk-engine";
import { formatHectares, formatCO2 } from "@/lib/utils";
import type { Farm, RiskAlert } from "@/types";
import Link from "next/link";

const FarmMap = dynamic(
  () => import("@/components/maps/farm-map").then((m) => m.FarmMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="h-[260px] rounded-2xl border border-border bg-muted/50 flex items-center justify-center">
      <Satellite className="w-7 h-7 text-green-500/25 animate-pulse" />
    </div>
  );
}

function TimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Compute dashboard-level intelligence from farms
function useDashboardIntelligence(farms: Farm[]) {
  return useMemo(() => {
    if (!farms.length) return null;

    let totalArea = 0;
    let totalCarbon = 0;
    let totalCredits = 0;
    let ndviSum = 0;
    let healthSum = 0;
    const farmRisks: Array<{ farm: Farm; ndvi: number; risk: ReturnType<typeof assessRisk>; alerts: RiskAlert[] }> = [];

    farms.forEach((farm) => {
      const result = computeFarmNDVI({
        farmId: farm.id,
        cropType: farm.cropType,
        irrigationType: farm.irrigationType,
        state: farm.state,
        areaHectares: farm.areaHectares,
      });
      const ndvi = result.current.ndvi;
      const carbon = computeCarbonIntelligence(farm, ndvi);
      const risk = assessRisk(farm, ndvi, null);
      const health = computeHealthScore(ndvi);

      totalArea += farm.areaHectares;
      totalCarbon += carbon.carbonScoreTonnes;
      totalCredits += carbon.carbonCreditEstimate;
      ndviSum += ndvi;
      healthSum += health.score;

      if (risk.alerts.length > 0) {
        farmRisks.push({ farm, ndvi, risk, alerts: risk.alerts });
      }
    });

    const avgNDVI = ndviSum / farms.length;
    const avgHealth = Math.round(healthSum / farms.length);

    // NDVI chart: use the first farm's time series as portfolio trend
    let ndviChartData: Array<{ month: string; ndvi: number; biomass: number }> = [];
    if (farms.length > 0) {
      const first = computeFarmNDVI({
        farmId: farms[0].id,
        cropType: farms[0].cropType,
        irrigationType: farms[0].irrigationType,
        state: farms[0].state,
      });
      ndviChartData = first.timeSeries.map((pt) => ({
        month: pt.month,
        ndvi: parseFloat(
          ((ndviSum / farms.length + (pt.ndvi - first.current.ndvi)) / 1).toFixed(3)
        ),
        biomass: parseFloat((pt.ndvi * 8.4).toFixed(2)),
      }));
    }

    // Carbon chart: sustainability trend from NDVI series
    const carbonChartData = ndviChartData.map((pt) => ({
      month: pt.month,
      carbonScore: computeHealthScore(pt.ndvi).score,
      co2eReduction: parseFloat((pt.ndvi * totalArea * 0.8).toFixed(1)),
    }));

    const highRiskFarms = farmRisks.filter(
      (r) => r.risk.severity === "high" || r.risk.severity === "critical"
    );

    return {
      totalArea,
      totalCarbon: parseFloat(totalCarbon.toFixed(2)),
      totalCredits: parseFloat(totalCredits.toFixed(2)),
      avgNDVI: parseFloat(avgNDVI.toFixed(3)),
      avgHealth,
      activeFarms: farms.filter((f) => f.status === "active" || f.status === "monitoring").length,
      farmRisks,
      highRiskFarms,
      ndviChartData,
      carbonChartData,
    };
  }, [farms]);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { farms, loading: farmsLoading } = useFarms(user?.uid ?? null);
  const intel = useDashboardIntelligence(farms);
  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  // Collect all active alerts across all high-risk farms
  const globalAlerts = useMemo(() => {
    if (!intel) return [];
    return intel.highRiskFarms.flatMap((r) =>
      r.alerts.map((a) => ({ ...a, farmName: r.farm.name, farmId: r.farm.id }))
    );
  }, [intel]);

  const loading = farmsLoading;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Alert strip */}
      {globalAlerts.length > 0 && (
        <AlertStrip
          alerts={globalAlerts}
          farmName={globalAlerts[0]?.farmName}
          farmId={globalAlerts[0]?.farmId}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            <TimeOfDay />, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {farms.length > 0
              ? `Monitoring ${farms.length} farm${farms.length !== 1 ? "s" : ""} · ${intel?.highRiskFarms.length ?? 0} require attention`
              : "No farms registered yet"}
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
              NDVI Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPIs — real intelligence */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Total Farms"
          value={loading ? "—" : farms.length}
          icon={Map}
          color="green"
          index={0}
        />
        <StatsCard
          title="Area Monitored"
          value={loading ? "—" : formatHectares(intel?.totalArea ?? 0)}
          icon={Activity}
          color="emerald"
          index={1}
        />
        <StatsCard
          title="Health Score"
          value={loading ? "—" : intel?.avgHealth ?? 0}
          unit="/100"
          icon={BarChart3}
          color="teal"
          index={2}
        />
        <StatsCard
          title="Est. CO₂e Sequestered"
          value={loading ? "—" : formatCO2(intel?.totalCarbon ?? 0)}
          icon={Leaf}
          color="green"
          description="NDVI-derived estimate"
          index={3}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Active Farms"
          value={loading ? "—" : intel?.activeFarms ?? 0}
          icon={Users}
          color="blue"
          index={4}
        />
        <StatsCard
          title="Avg NDVI"
          value={loading ? "—" : intel?.avgNDVI.toFixed(3) ?? "—"}
          icon={TrendingUp}
          color="green"
          index={5}
        />
        <StatsCard
          title="Risk Alerts"
          value={loading ? "—" : globalAlerts.length}
          icon={ShieldAlert}
          color={globalAlerts.length > 0 ? "yellow" : "green"}
          description={globalAlerts.length > 0 ? "Needs attention" : "All clear"}
          index={6}
        />
        <StatsCard
          title="Carbon Credits"
          value={loading ? "—" : `$${(intel?.totalCredits ?? 0).toLocaleString()}`}
          icon={BarChart3}
          color="yellow"
          description="@ $15/tCO₂e"
          index={7}
        />
      </div>

      {/* Charts + Monitoring */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Carbon Sustainability Trend</CardTitle>
                <Badge variant="green" dot>
                  {farms.length > 0 ? "Live data" : "No farms"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {intel?.carbonChartData.length ? (
                <CarbonScoreChart data={intel.carbonChartData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground/40 text-sm">
                  Add farms to see carbon trend
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {user && farms.length > 0 ? (
                <MonitoringStatus farms={farms} userId={user.uid} />
              ) : (
                <div className="py-6 text-center text-muted-foreground/40 text-sm">
                  {!user ? "Sign in to enable monitoring" : "No farms to monitor"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map + NDVI + Risk */}
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
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>NDVI Portfolio</CardTitle>
                {intel && (
                  <Badge variant="green" dot size="sm">
                    {intel.avgNDVI.toFixed(3)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {intel?.ndviChartData.length ? (
                <>
                  <NDVIChart data={intel.ndviChartData} className="h-[160px]" />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-muted/60 border border-border">
                      <p className="text-[10px] text-muted-foreground mb-1">Peak</p>
                      <p className="text-sm font-bold text-green-400 font-mono">
                        {Math.max(...intel.ndviChartData.map((d) => d.ndvi)).toFixed(3)}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/60 border border-border">
                      <p className="text-[10px] text-muted-foreground mb-1">Current</p>
                      <p className="text-sm font-bold text-foreground font-mono">
                        {intel.avgNDVI.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-muted-foreground/40 text-sm">
                  Add farms to see NDVI
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risk Overview + Activity */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-green-400" />
                  Risk Intelligence — All Farms
                </CardTitle>
                <Link href="/satellite">
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                    <RefreshCw className="w-3 h-3" />
                    Update
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {intel && intel.farmRisks.length > 0 ? (
                <div className="space-y-3">
                  {intel.farmRisks.slice(0, 4).map(({ farm, risk }) => (
                    <Link key={farm.id} href={`/farms/${farm.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-green-500/20 hover:bg-muted/40 transition-all cursor-pointer">
                        <div
                          className="w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            background: `${riskSeverityColor(risk.severity)}18`,
                            borderColor: `${riskSeverityColor(risk.severity)}30`,
                            color: riskSeverityColor(risk.severity),
                          }}
                        >
                          {risk.overallRisk}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {farm.name}
                          </p>
                          <p className="text-xs text-muted-foreground/60 truncate">
                            {risk.alerts[0]?.title ?? "No active alerts"}
                          </p>
                        </div>
                        <RiskScoreBadge
                          score={risk.overallRisk}
                          severity={risk.severity}
                          size="sm"
                        />
                      </div>
                    </Link>
                  ))}
                  {farms.filter(
                    (f) => !intel.farmRisks.find((r) => r.farm.id === f.id)
                  ).length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/5 border border-green-500/15 text-xs text-green-400">
                      <Activity className="w-3.5 h-3.5" />
                      {
                        farms.filter(
                          (f) => !intel.farmRisks.find((r) => r.farm.id === f.id)
                        ).length
                      }{" "}
                      farm
                      {farms.filter(
                        (f) => !intel.farmRisks.find((r) => r.farm.id === f.id)
                      ).length !== 1
                        ? "s"
                        : ""}{" "}
                      with no active alerts
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  {farms.length === 0 ? (
                    <>
                      <Map className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground/50">
                        Add farms to see risk intelligence
                      </p>
                    </>
                  ) : (
                    <>
                      <Activity className="w-6 h-6 text-green-400/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground/50">
                        All farms in normal range — no active alerts
                      </p>
                    </>
                  )}
                </div>
              )}
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
    </div>
  );
}
