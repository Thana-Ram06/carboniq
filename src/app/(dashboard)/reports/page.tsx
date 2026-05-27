"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Plus,
  Filter,
  BarChart3,
  Satellite,
  Leaf,
  Map,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/utils";
import type { ReportType } from "@/types";
import toast from "react-hot-toast";

const MOCK_REPORTS = [
  {
    id: "r1",
    title: "Q4 2024 Carbon Sustainability Summary",
    type: "carbon" as ReportType,
    status: "ready",
    period: "Oct 2024 – Dec 2024",
    farms: 8,
    co2e: 142.4,
    createdAt: { seconds: Date.now() / 1000 - 86400 },
  },
  {
    id: "r2",
    title: "Kharif Season NDVI Report",
    type: "satellite" as ReportType,
    status: "ready",
    period: "Jun 2024 – Oct 2024",
    farms: 12,
    co2e: 0,
    createdAt: { seconds: Date.now() / 1000 - 172800 },
  },
  {
    id: "r3",
    title: "Farm Portfolio Overview — Maharashtra",
    type: "farm" as ReportType,
    status: "ready",
    period: "Jan 2024 – Dec 2024",
    farms: 6,
    co2e: 84.2,
    createdAt: { seconds: Date.now() / 1000 - 604800 },
  },
  {
    id: "r4",
    title: "Annual Sustainability Report 2024",
    type: "sustainability" as ReportType,
    status: "generating",
    period: "Full Year 2024",
    farms: 15,
    co2e: 0,
    createdAt: { seconds: Date.now() / 1000 - 3600 },
  },
];

const TYPE_CONFIG: Record<ReportType, { icon: typeof FileText; color: string; bg: string; label: string }> = {
  carbon: { icon: BarChart3, color: "text-green-400", bg: "bg-green-500/8", label: "Carbon" },
  satellite: { icon: Satellite, color: "text-blue-400", bg: "bg-blue-500/8", label: "Satellite" },
  farm: { icon: Map, color: "text-emerald-400", bg: "bg-emerald-500/8", label: "Farm" },
  sustainability: { icon: Leaf, color: "text-teal-400", bg: "bg-teal-500/8", label: "Sustainability" },
};

function ReportCard({
  report,
}: {
  report: (typeof MOCK_REPORTS)[0];
}) {
  const config = TYPE_CONFIG[report.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card hover className="group">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground leading-snug">
                  {report.title}
                </h3>
                {report.status === "ready" ? (
                  <Badge variant="green" size="sm" dot className="flex-shrink-0">
                    Ready
                  </Badge>
                ) : report.status === "generating" ? (
                  <Badge variant="yellow" size="sm" className="flex-shrink-0">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating
                  </Badge>
                ) : (
                  <Badge variant="red" size="sm" className="flex-shrink-0">
                    Error
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.period}
                </span>
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <Map className="w-3 h-3" />
                  {report.farms} farms
                </span>
                {report.co2e > 0 && (
                  <span className="text-xs text-green-500/70 flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    {report.co2e} tCO₂e
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground/50 mt-1">
                Generated {formatTimestamp(report.createdAt as { seconds: number })}
              </p>

              <div className="flex gap-2 mt-3">
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs text-green-500/70 hover:text-green-400 transition-colors"
                  onClick={() => toast.success("Download started (PDF export coming soon)")}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs text-green-500/70 hover:text-green-400 transition-colors"
                  onClick={() => toast.success("CSV export coming soon")}
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ReportsPage() {
  const [filter, setFilter] = useState<ReportType | "all">("all");
  const [generating, setGenerating] = useState(false);

  const filtered =
    filter === "all"
      ? MOCK_REPORTS
      : MOCK_REPORTS.filter((r) => r.type === filter);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setGenerating(false);
    toast.success("New report queued for generation");
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and manage sustainability reports
          </p>
        </div>
        <Button variant="primary" onClick={handleGenerate} loading={generating}>
          <Plus className="w-4 h-4" />
          Generate Report
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: CheckCircle2, label: "Reports Ready", value: MOCK_REPORTS.filter(r => r.status === "ready").length, color: "text-green-400", bg: "bg-green-500/8" },
          { icon: Loader2, label: "Generating", value: MOCK_REPORTS.filter(r => r.status === "generating").length, color: "text-yellow-400", bg: "bg-yellow-500/8" },
          { icon: Leaf, label: "Total CO₂e Saved", value: "226 t", color: "text-emerald-400", bg: "bg-emerald-500/8" },
          { icon: AlertCircle, label: "Farms Covered", value: 15, color: "text-blue-400", bg: "bg-blue-500/8" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-2xl border border-border bg-card">
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground/60" />
        {(["all", "carbon", "satellite", "farm", "sustainability"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                filter === f
                  ? "bg-green-500/12 border border-green-500/25 text-green-300"
                  : "text-muted-foreground/60 border border-transparent hover:border-border hover:text-foreground"
              }`}
            >
              {f === "all" ? "All Reports" : f}
            </button>
          )
        )}
      </div>

      {/* Report list */}
      <div className="flex flex-col gap-3">
        {filtered.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground/60">No reports found for this filter</p>
        </div>
      )}

      {/* Note about exports */}
      <div className="mt-8 p-4 rounded-2xl border border-border bg-card flex gap-3">
        <AlertCircle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          <span className="text-foreground/80 font-medium">PDF & CSV export</span>{" "}
          and{" "}
          <span className="text-foreground/80 font-medium">
            automated report generation
          </span>{" "}
          are in active development. Reports shown are demonstration data.
          Integration with real farm data and carbon estimations is planned for
          the next release.
        </p>
      </div>
    </div>
  );
}
