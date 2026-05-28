import { TrendingUp, FileText } from "lucide-react";
import { getBenchmarkReports } from "@/lib/benchmarks/benchmark-reporter";

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-400 bg-green-500/10 border-green-500/30",
  B: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  C: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  D: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  F: "text-red-400 bg-red-500/10 border-red-500/30",
};

export function BenchmarkReport() {
  const reports = getBenchmarkReports();

  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <div key={r.id} className="rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">{r.title}</p>
                <p className="text-xs text-slate-500">{r.reportDate} · {r.coverageStates} states · {r.coverageDistricts} districts · {r.totalObservations.toLocaleString()} observations</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="h-3 w-3" />
              +{r.improvementFromPrior}%
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "NDVI Accuracy", grade: r.ndviAccuracyGrade },
              { label: "Carbon Accuracy", grade: r.carbonAccuracyGrade },
              { label: "Overall", val: `${r.overallAccuracyPct}%` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-700/30 px-3 py-2 text-center">
                {"grade" in item && item.grade ? (
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-sm font-bold ${GRADE_COLOR[item.grade] ?? GRADE_COLOR.C}`}>{item.grade}</span>
                ) : (
                  <p className="text-white font-semibold">{item.val}</p>
                )}
                <p className="text-[10px] text-slate-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1 mb-2">
            <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide">Key Findings</p>
            {r.findings.map((f, i) => (
              <p key={i} className="text-[10px] text-slate-400 pl-2 before:content-['·'] before:mr-1.5 before:text-slate-600">{f}</p>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wide">Recommendations</p>
            {r.recommendations.map((rec, i) => (
              <p key={i} className="text-[10px] text-slate-400 pl-2 before:content-['→'] before:mr-1.5 before:text-blue-500">{rec}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
