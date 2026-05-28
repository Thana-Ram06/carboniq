import { CheckCircle2, Clock } from "lucide-react";
import { getRegionalCalibrations } from "@/lib/calibration/regional-calibration";

export function RegionalCalibrationDashboard() {
  const cals = getRegionalCalibrations();
  const byState = cals.reduce<Record<string, typeof cals>>((acc, c) => {
    (acc[c.state] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(byState).map(([state, districts]) => (
        <div key={state} className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
          <p className="text-sm font-semibold text-white mb-2">{state}</p>
          <div className="grid grid-cols-1 gap-1.5">
            {districts.map((d) => (
              <div key={d.district} className="flex items-center gap-3 text-[10px]">
                {d.approved
                  ? <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" />
                  : <Clock className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                }
                <span className="text-slate-300 w-24 flex-shrink-0">{d.district}</span>
                <span className="text-slate-500">Bias {d.ndviBiasCorrection >= 0 ? "+" : ""}{d.ndviBiasCorrection.toFixed(4)}</span>
                <span className="text-slate-500">Scale {d.carbonScaleFactor.toFixed(4)}</span>
                <span className="text-slate-500">R² {d.r2Score.toFixed(3)}</span>
                <span className="text-slate-500">n={d.sampleCount}</span>
                <span className={d.approved ? "text-green-400" : "text-yellow-400"}>{d.approved ? "Approved" : "Pending"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
