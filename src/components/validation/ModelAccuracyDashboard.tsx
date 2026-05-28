import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getModelAccuracyMetrics } from "@/lib/validation/model-accuracy";

export function ModelAccuracyDashboard() {
  const metrics = getModelAccuracyMetrics();

  const BENCH_STYLE: Record<string, string> = {
    passing: "text-green-400 bg-green-500/10 border-green-500/20",
    marginal: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    failing: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const BENCH_ICON: Record<string, typeof CheckCircle2> = {
    passing: CheckCircle2,
    marginal: AlertTriangle,
    failing: XCircle,
  };

  return (
    <div className="space-y-3">
      {metrics.map((m) => {
        const StyleCls = BENCH_STYLE[m.benchmark] ?? BENCH_STYLE.passing;
        const Icon = BENCH_ICON[m.benchmark] ?? CheckCircle2;
        return (
          <div key={m.modelName} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">{m.modelName}</p>
                <p className="text-xs text-slate-500">{m.version} · {m.datasetSize.toLocaleString()} samples</p>
              </div>
              <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${StyleCls}`}>
                <Icon className="h-2.5 w-2.5" />
                {m.benchmark}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-[10px]">
              {[
                { label: "NDVI R²", val: m.ndviR2.toFixed(3) },
                { label: "Carbon R²", val: m.carbonR2.toFixed(3) },
                { label: "Drought AUC", val: m.droughtAUC.toFixed(3) },
                { label: "Precision", val: m.anomalyPrecision.toFixed(3) },
                { label: "Recall", val: m.anomalyRecall.toFixed(3) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-slate-700/30 px-2 py-1.5 text-center">
                  <p className="text-white font-semibold">{stat.val}</p>
                  <p className="text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
