import { ShieldCheck, MapPin } from "lucide-react";
import { getReliabilitySummary, getValidationDensities } from "@/lib/reliability/data-reliability";
import { DataReliabilityEngine } from "@/components/reliability/DataReliabilityEngine";

export default function ReliabilityPage() {
  const summary = getReliabilitySummary();
  const densities = getValidationDensities();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Reliability Engine</h1>
        <p className="text-slate-400 mt-1 text-sm">Regional confidence scores, validation density maps, calibration currency tracking, and operational consistency metrics</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.avgOverallConfidence}%</p>
          <p className="text-xs text-slate-400">Avg Confidence</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.avgReliabilityScore}%</p>
          <p className="text-xs text-slate-400">Avg Reliability Score</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.statesAssessed}</p>
          <p className="text-xs text-slate-400">States Assessed</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.gradeDistribution.A ?? 0}</p>
          <p className="text-xs text-slate-400">Grade-A States</p>
        </div>
      </div>

      {/* Grade distribution */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <p className="text-sm font-semibold text-white mb-3">Grade Distribution</p>
        <div className="flex gap-3">
          {(["A", "B", "C", "D", "F"] as const).map((grade) => {
            const count = summary.gradeDistribution[grade] ?? 0;
            const colors: Record<string, string> = { A: "text-green-400 border-green-500/30 bg-green-500/10", B: "text-blue-400 border-blue-500/30 bg-blue-500/10", C: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", D: "text-orange-400 border-orange-500/30 bg-orange-500/10", F: "text-red-400 border-red-500/30 bg-red-500/10" };
            return (
              <div key={grade} className={`rounded-xl border px-4 py-2 text-center flex-1 ${colors[grade] ?? colors.C}`}>
                <p className="text-xl font-bold">{grade}</p>
                <p className="text-[10px] mt-0.5">{count} states</p>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Lowest region: <span className="text-white">{summary.lowestRegion}</span></p>
      </div>

      {/* Main reliability engine */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Regional Confidence & Reliability</h2>
        </div>
        <DataReliabilityEngine />
      </div>

      {/* Validation density */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Validation Density by District</h2>
        </div>
        <div className="space-y-2">
          {densities.map((d) => (
            <div key={`${d.district}-${d.state}`} className="flex items-center gap-3">
              <span className="text-xs text-white w-24 flex-shrink-0">{d.district}</span>
              <span className="text-[10px] text-slate-500 w-20 flex-shrink-0">{d.state}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-700">
                <div className="h-1.5 rounded-full bg-blue-500/70" style={{ width: `${Math.min(100, d.densityScore).toFixed(0)}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 w-16 text-right">{d.observationCount.toLocaleString()} obs</span>
              <span className="text-[10px] text-slate-500 w-16 text-right">{d.coveragePct.toFixed(0)}% cov</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
