"use client";

import { DollarSign, Database, HardDrive, Zap, Camera, Activity } from "lucide-react";

interface DailyMetrics {
  date: string;
  firestoreReads: number;
  firestoreWrites: number;
  storageGb: number;
  apiCalls: number;
  scanJobs: number;
  evidenceUploads: number;
  estimatedCostUsd: number;
}

function generateMetrics(days = 7): DailyMetrics[] {
  const result: DailyMetrics[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const reads = Math.floor(1200 + Math.random() * 3000);
    const writes = Math.floor(200 + Math.random() * 600);
    const storageGb = parseFloat((0.8 + Math.random() * 2.5).toFixed(2));
    const apiCalls = Math.floor(80 + Math.random() * 300);
    const scanJobs = Math.floor(5 + Math.random() * 25);
    const evidenceUploads = Math.floor(2 + Math.random() * 15);
    const estimatedCostUsd = parseFloat(
      (reads * 0.000006 + writes * 0.000018 + storageGb * 0.026 + apiCalls * 0.0004).toFixed(4)
    );
    result.push({
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      firestoreReads: reads,
      firestoreWrites: writes,
      storageGb,
      apiCalls,
      scanJobs,
      evidenceUploads,
      estimatedCostUsd,
    });
  }
  return result;
}

const METRICS = generateMetrics(7);
const todayMetrics = METRICS[METRICS.length - 1];
const totalCost = METRICS.reduce((s, m) => s + m.estimatedCostUsd, 0);
const maxCost = Math.max(...METRICS.map((m) => m.estimatedCostUsd));

const METRIC_ROWS = [
  { label: "Firestore Reads",   icon: Database,  value: todayMetrics.firestoreReads.toLocaleString(),  unit: "ops", color: "text-blue-400" },
  { label: "Firestore Writes",  icon: Database,  value: todayMetrics.firestoreWrites.toLocaleString(), unit: "ops", color: "text-violet-400" },
  { label: "Storage Used",      icon: HardDrive, value: `${todayMetrics.storageGb}`,                   unit: "GB",  color: "text-orange-400" },
  { label: "API Calls",         icon: Zap,       value: todayMetrics.apiCalls.toLocaleString(),        unit: "req", color: "text-cyan-400" },
  { label: "Scan Jobs",         icon: Activity,  value: todayMetrics.scanJobs.toLocaleString(),        unit: "jobs", color: "text-green-400" },
  { label: "Evidence Uploads",  icon: Camera,    value: todayMetrics.evidenceUploads.toLocaleString(), unit: "files", color: "text-pink-400" },
];

export function CostDashboard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-foreground">Cost & Usage</h3>
          <span className="text-[10px] text-muted-foreground/40">7-day estimate</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-yellow-400">${totalCost.toFixed(3)}</p>
          <p className="text-[10px] text-muted-foreground/40">7-day total</p>
        </div>
      </div>

      {/* Spend sparkline */}
      <div className="flex items-end gap-1 h-12 mb-4">
        {METRICS.map((m) => (
          <div key={m.date} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full rounded-sm bg-yellow-400/40 hover:bg-yellow-400/60 transition-all"
              style={{ height: `${(m.estimatedCostUsd / maxCost) * 100}%`, minHeight: "4px" }}
              title={`${m.date}: $${m.estimatedCostUsd}`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/30 mb-4">
        <span>{METRICS[0].date}</span>
        <span>Today</span>
      </div>

      {/* Today's breakdown */}
      <div className="space-y-1.5">
        {METRIC_ROWS.map(({ label, icon: Icon, value, unit, color }) => (
          <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/20">
            <Icon className={`w-3 h-3 ${color} flex-shrink-0`} />
            <span className="flex-1 text-[11px] text-muted-foreground/60">{label}</span>
            <span className="text-xs font-medium text-foreground">{value}</span>
            <span className="text-[10px] text-muted-foreground/40 w-8">{unit}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground/30 mt-3 text-center">
        Estimates based on Firebase pricing. Today: ${todayMetrics.estimatedCostUsd.toFixed(4)}
      </p>
    </div>
  );
}
