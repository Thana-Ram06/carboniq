"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText, Plus, RefreshCw, ShieldCheck, Leaf,
  BarChart3, TrendingUp, Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MRVReportCard } from "@/components/reports/MRVReportCard";
import { PDFExporter } from "@/components/reports/PDFExporter";
import { ConfidenceScoreWidget } from "@/components/verification/ConfidenceScore";
import { useAuth } from "@/hooks/use-auth";
import { useFarms } from "@/hooks/use-farms";
import { getMonitoringReports } from "@/lib/firestore";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { computeHealthScore } from "@/lib/intelligence/health-scoring";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { assessRisk } from "@/lib/monitoring/risk-engine";
import type { MonitoringReport, ReportFormat } from "@/types";
import type { MRVReportData } from "@/lib/reporting/mrv-report";
import toast from "react-hot-toast";

const FORMAT_OPTIONS: { value: ReportFormat; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "mrv", label: "MRV Report", icon: ShieldCheck, desc: "Full MRV verification report with audit trail" },
  { value: "carbon_summary", label: "Carbon Summary", icon: Leaf, desc: "Carbon score, biomass, and credit estimation" },
  { value: "audit_export", label: "Audit Export", icon: BarChart3, desc: "Audit history and checklist export" },
  { value: "executive", label: "Executive", icon: TrendingUp, desc: "High-level summary for stakeholders" },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const { farms, loading: farmsLoading } = useFarms(user?.uid ?? null);
  const [reports, setReports] = useState<MonitoringReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("mrv");
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<MRVReportData | null>(null);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];

  useEffect(() => {
    if (farms.length > 0 && !selectedFarmId) setSelectedFarmId(farms[0].id);
  }, [farms, selectedFarmId]);

  const loadReports = useCallback(async () => {
    if (!user?.uid) return;
    setLoadingReports(true);
    try {
      const r = await getMonitoringReports(user.uid, 20);
      setReports(r);
    } finally {
      setLoadingReports(false);
    }
  }, [user?.uid]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const generateReport = useCallback(async () => {
    if (!selectedFarm || !user?.uid) { toast.error("Select a farm first"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId: selectedFarm.id, userId: user.uid, format: selectedFormat, periodDays: 30 }),
      });
      const data = await res.json() as { reportId: string; reportData: MRVReportData };
      if (!res.ok) throw new Error("Generation failed");

      setActiveReport(data.reportData);
      await loadReports();
      toast.success("MRV report generated successfully");
    } catch {
      toast.error("Report generation failed");
    } finally {
      setGenerating(false);
    }
  }, [selectedFarm, user?.uid, selectedFormat, loadReports]);

  // Compute live preview for selected farm
  const livePreview = useMemo(() => {
    if (!selectedFarm) return null;
    const ndviResult = computeFarmNDVI({
      farmId: selectedFarm.id, cropType: selectedFarm.cropType,
      irrigationType: selectedFarm.irrigationType, state: selectedFarm.state,
      areaHectares: selectedFarm.areaHectares,
    });
    const ndvi = ndviResult.current.ndvi;
    return {
      ndvi,
      health: computeHealthScore(ndvi),
      carbon: computeCarbonIntelligence(selectedFarm, ndvi),
      risk: assessRisk(selectedFarm, ndvi, null),
    };
  }, [selectedFarm]);

  const reportStats = {
    total: reports.length,
    ready: reports.filter((r) => r.status === "ready").length,
    avgConfidence: reports.length > 0
      ? Math.round(reports.reduce((s, r) => s + (r.confidenceScore ?? 0), 0) / reports.length)
      : 0,
  };

  if (farmsLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-card rounded-xl w-64" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">MRV Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verification-ready reports for carbon credit certification and stakeholder reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadReports} disabled={loadingReports}>
            <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="primary" size="sm" onClick={generateReport} disabled={generating || !selectedFarm}>
            {generating ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</> : <><Plus className="w-3.5 h-3.5" /> Generate Report</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="text-2xl font-bold text-foreground">{reportStats.total}</p>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Total Reports</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="text-2xl font-bold text-green-400">{reportStats.ready}</p>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Ready for Download</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className={`text-2xl font-bold ${reportStats.avgConfidence >= 70 ? "text-green-400" : reportStats.avgConfidence >= 40 ? "text-yellow-400" : "text-muted-foreground"}`}>
            {reportStats.avgConfidence > 0 ? `${reportStats.avgConfidence}/100` : "—"}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Avg Confidence</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration panel */}
        <div className="space-y-4">
          {/* Farm selector */}
          <Card>
            <CardHeader><CardTitle>Farm</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {farms.map((farm) => (
                  <button
                    key={farm.id}
                    onClick={() => setSelectedFarmId(farm.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all ${
                      selectedFarmId === farm.id
                        ? "border-green-500/30 bg-green-500/8"
                        : "border-border bg-muted hover:border-green-500/20"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${selectedFarmId === farm.id ? "bg-green-400" : "bg-muted-foreground/30"}`} />
                    <span className="text-sm text-foreground flex-1 truncate">{farm.name}</span>
                    <span className="text-[10px] text-muted-foreground/40">{farm.areaHectares.toFixed(1)}ha</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Format selector */}
          <Card>
            <CardHeader><CardTitle>Report Format</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {FORMAT_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedFormat(value)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      selectedFormat === value
                        ? "border-green-500/30 bg-green-500/8"
                        : "border-border bg-muted hover:border-green-500/20"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${selectedFormat === value ? "text-green-400" : "text-muted-foreground/50"}`} />
                    <div>
                      <p className={`text-xs font-medium ${selectedFormat === value ? "text-green-300" : "text-foreground"}`}>{label}</p>
                      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live preview metrics */}
          {livePreview && (
            <Card>
              <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "NDVI", value: livePreview.ndvi.toFixed(3), color: "text-green-400" },
                    { label: "Health", value: livePreview.health.label, color: "text-emerald-400" },
                    { label: "CO₂e", value: `${livePreview.carbon.carbonScoreTonnes.toFixed(1)}t`, color: "text-foreground" },
                    { label: "Risk", value: livePreview.risk.severity, color: livePreview.risk.severity === "low" ? "text-green-400" : "text-orange-400" },
                  ].map((m) => (
                    <div key={m.label} className="p-2.5 rounded-xl bg-muted border border-border">
                      <p className="text-[10px] text-muted-foreground/50">{m.label}</p>
                      <p className={`text-sm font-bold ${m.color} capitalize`}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <Button variant="primary" size="sm" className="w-full" onClick={generateReport} disabled={generating}>
                  <Zap className="w-3.5 h-3.5" />
                  {generating ? "Generating…" : "Generate & Download"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reports list + active report */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active report viewer */}
          {activeReport && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Generated Report — {activeReport.farm.name}
                  </CardTitle>
                  <PDFExporter reportData={activeReport} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConfidenceScoreWidget score={activeReport.confidence} />
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-muted border border-border text-center">
                    <p className="text-sm font-bold text-green-400 font-mono">{activeReport.ndvi.toFixed(3)}</p>
                    <p className="text-[10px] text-muted-foreground/50">NDVI</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted border border-border text-center">
                    <p className="text-sm font-bold text-emerald-400 font-mono">{activeReport.carbon.carbonScoreTonnes.toFixed(1)}t</p>
                    <p className="text-[10px] text-muted-foreground/50">CO₂e</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted border border-border text-center">
                    <p className="text-sm font-bold text-foreground">${activeReport.carbon.carbonCreditEstimate.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground/50">Credits</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                  <p className="text-xs text-green-300/80 leading-relaxed">{activeReport.certificationNote}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground/50 font-medium">Methodology</p>
                  {activeReport.methodology.slice(0, 3).map((m, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground/40 leading-relaxed">• {m}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report history */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground/60" />
                  Report History
                </CardTitle>
                <Badge variant="gray" size="sm">{reports.length} reports</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl bg-muted border border-border animate-pulse" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-3xl bg-muted border border-border flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">No reports yet</p>
                  <p className="text-xs text-muted-foreground/50 max-w-xs">
                    Generate your first MRV report to begin the verification process.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={generateReport} disabled={generating || !selectedFarm}>
                    <Plus className="w-3.5 h-3.5" /> Generate First Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <MRVReportCard
                      key={report.id}
                      report={report}
                      onDownload={() => toast("Re-generate to download PDF")}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
