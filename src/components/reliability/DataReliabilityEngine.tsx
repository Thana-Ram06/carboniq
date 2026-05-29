import { getRegionalConfidences, getDataReliabilityScores } from "@/lib/reliability/data-reliability";

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-400 bg-green-500/10 border-green-500/30",
  B: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  C: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  D: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  F: "text-red-400 bg-red-500/10 border-red-500/30",
};

export function DataReliabilityEngine() {
  const confidence = getRegionalConfidences();
  const scores = getDataReliabilityScores();

  return (
    <div className="space-y-4">
      {/* Regional confidence */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">State Confidence Levels</p>
        <div className="space-y-1.5">
          {confidence.map((c) => (
            <div key={c.state} className="flex items-center gap-3">
              <span className="text-xs text-white w-32 flex-shrink-0">{c.state}</span>
              <div className="flex-1 grid grid-cols-3 gap-1">
                {[c.ndviConfidence, c.carbonConfidence, c.droughtConfidence].map((val, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-slate-700 relative">
                    <div className="h-1.5 rounded-full bg-blue-500/60" style={{ width: `${val.toFixed(0)}%` }} />
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 w-12 text-right">{c.overallConfidence}%</span>
              <span className={`w-7 text-center text-xs font-bold rounded-full border px-1 ${GRADE_COLOR[c.reliabilityGrade] ?? GRADE_COLOR.C}`}>{c.reliabilityGrade}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-1 text-[9px] text-slate-600">
          <span>■ NDVI</span><span>■ Carbon</span><span>■ Drought</span>
        </div>
      </div>

      {/* Regional scores */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Regional Reliability Scores</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {scores.map((s) => (
            <div key={s.region} className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
              <p className="text-xs font-semibold text-white">{s.region}</p>
              <p className="text-xl font-bold text-blue-400 mt-1">{s.overallScore}%</p>
              <div className="mt-1 space-y-0.5 text-[9px] text-slate-500">
                <p>Freshness: {s.dataFreshnessPct}%</p>
                <p>Coverage: {s.validationCoveragePct}%</p>
                <p>Calibration: {s.calibrationCurrencyPct}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
