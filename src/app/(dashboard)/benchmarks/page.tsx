import { Award, TrendingUp, FileText } from "lucide-react";
import { getBenchmarkSummary } from "@/lib/benchmarks/benchmark-reporter";
import { BenchmarkReport } from "@/components/benchmarks/BenchmarkReport";

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-400 bg-green-500/10 border-green-500/30",
  B: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  C: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  D: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  F: "text-red-400 bg-red-500/10 border-red-500/30",
};

export default function BenchmarksPage() {
  const summary = getBenchmarkSummary();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Scientific Benchmarks</h1>
        <p className="text-slate-400 mt-1 text-sm">Quarterly accuracy reports, seasonal validation results, and cross-regional model comparisons</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.latestOverallAccuracy}%</p>
          <p className="text-xs text-slate-400">Latest Accuracy</p>
        </div>
        <div className={`rounded-xl border px-4 py-3 ${GRADE_COLOR[summary.latestNDVIGrade] ?? GRADE_COLOR.C}`}>
          <p className="text-2xl font-bold">{summary.latestNDVIGrade}</p>
          <p className="text-xs text-slate-400">NDVI Grade</p>
        </div>
        <div className={`rounded-xl border px-4 py-3 ${GRADE_COLOR[summary.latestCarbonGrade] ?? GRADE_COLOR.C}`}>
          <p className="text-2xl font-bold">{summary.latestCarbonGrade}</p>
          <p className="text-xs text-slate-400">Carbon Grade</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalObservationsAcrossReports.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Observations</p>
        </div>
      </div>

      {/* Grading scale */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-4 w-4 text-yellow-400" />
          <h2 className="text-sm font-semibold text-white">Accuracy Grading Scale</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { grade: "A", range: "≥95%", desc: "Excellent" },
            { grade: "B", range: "90–94%", desc: "Good" },
            { grade: "C", range: "85–89%", desc: "Acceptable" },
            { grade: "D", range: "75–84%", desc: "Below Standard" },
            { grade: "F", range: "<75%", desc: "Failing" },
          ].map((g) => (
            <div key={g.grade} className={`rounded-lg border px-3 py-1.5 text-center ${GRADE_COLOR[g.grade] ?? GRADE_COLOR.C}`}>
              <p className="text-sm font-bold">{g.grade}</p>
              <p className="text-[9px] text-slate-400">{g.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark reports */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Benchmark Reports</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.totalReports} reports · Latest: {summary.latestReportDate}</span>
        </div>
        <BenchmarkReport />
      </div>

      {/* Improvement trend */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Continuous Improvement Framework</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { step: "1. Quarterly Evaluation", desc: "Full model re-evaluation against out-of-sample ground-truth data collected in the preceding quarter" },
            { step: "2. Calibration Update", desc: "Coefficient re-tuning based on identified systematic biases; regional adjustments applied per agro-climatic zone" },
            { step: "3. Publication & Audit", desc: "Benchmark results published to partner network; independent third-party audit for ISO and UNFCCC compliance" },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3">
              <p className="font-semibold text-white mb-1">{item.step}</p>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
