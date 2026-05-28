import { Settings2, CheckCircle2, AlertTriangle } from "lucide-react";
import { getCalibrationCoefficients } from "@/lib/calibration/calibration-engine";

export function CalibrationPanel() {
  const coeffs = getCalibrationCoefficients();

  return (
    <div className="space-y-2">
      {coeffs.map((c) => {
        const deviation = Math.abs(c.currentValue - c.defaultValue) / c.defaultValue;
        const isDeviated = deviation > 0.02;
        const pct = ((c.currentValue - c.minBound) / (c.maxBound - c.minBound)) * 100;
        return (
          <div key={c.id} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-mono text-blue-300">{c.paramName}</span>
              </div>
              {isDeviated
                ? <span className="flex items-center gap-1 text-[10px] text-yellow-400"><AlertTriangle className="h-2.5 w-2.5" />Deviated {(deviation * 100).toFixed(1)}%</span>
                : <span className="flex items-center gap-1 text-[10px] text-green-400"><CheckCircle2 className="h-2.5 w-2.5" />Within bounds</span>
              }
            </div>
            <p className="text-[10px] text-slate-400 mb-2">{c.description}</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-slate-500 w-8">{c.minBound}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-700 relative">
                <div className="absolute top-0 h-1.5 w-1 rounded-full bg-slate-500" style={{ left: `${((c.defaultValue - c.minBound) / (c.maxBound - c.minBound)) * 100}%` }} />
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, pct)).toFixed(1)}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 w-8 text-right">{c.maxBound}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Current: <span className="text-white font-mono">{c.currentValue.toFixed(5)}</span></span>
              <span>Default: <span className="text-slate-400 font-mono">{c.defaultValue}</span></span>
              <span>{c.calibratedBy}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
