import { getForecastAccuracyRecords } from "@/lib/validation/model-accuracy";

export function ConfidenceTrendChart() {
  const records = getForecastAccuracyRecords();
  const droughtRecords = records.filter((r) => r.parameter === "drought_prob");
  const maxSkill = Math.max(...droughtRecords.map((r) => r.skillScore));

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3">Forecast skill score vs. horizon (drought probability model)</p>
      <div className="flex items-end gap-2 h-24">
        {droughtRecords.map((r) => {
          const pct = maxSkill > 0 ? (r.skillScore / maxSkill) * 100 : 0;
          const color = r.skillScore >= 0.85 ? "bg-green-500" : r.skillScore >= 0.70 ? "bg-yellow-500" : "bg-red-500";
          return (
            <div key={r.horizonDays} className="flex flex-col items-center flex-1 gap-1">
              <span className="text-[9px] text-slate-400">{r.skillScore.toFixed(2)}</span>
              <div className="w-full rounded-t relative" style={{ height: `${pct.toFixed(0)}%` }}>
                <div className={`w-full h-full rounded-t ${color}/70 border border-${color.replace("bg-", "")}/40`} />
              </div>
              <span className="text-[9px] text-slate-500">{r.horizonDays}d</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {records.filter((r) => r.parameter === "ndvi_change").slice(0, 3).map((r) => (
          <div key={r.horizonDays} className="rounded-lg bg-slate-700/30 px-3 py-2">
            <p className="text-xs text-white font-semibold">{r.horizonDays}d NDVI</p>
            <p className="text-[10px] text-slate-400">MAE {r.mae.toFixed(4)} · Skill {r.skillScore.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
