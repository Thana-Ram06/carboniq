import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getOperationalHealthMetrics } from "@/lib/ops/operational-analytics";

const STATUS_STYLE: Record<string, string> = {
  healthy: "text-green-400 bg-green-500/10 border-green-500/20",
  degraded: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  down: "text-red-400 bg-red-500/10 border-red-500/20",
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  healthy: CheckCircle2,
  degraded: AlertTriangle,
  down: XCircle,
};

const CAT_LABEL: Record<string, string> = {
  data_pipeline: "Pipeline",
  model_inference: "Model",
  field_sync: "Field Sync",
  reporting: "Reporting",
  storage: "Storage",
};

export function OperationalHealthGrid() {
  const metrics = getOperationalHealthMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {metrics.map((m) => {
        const StyleCls = STATUS_STYLE[m.status] ?? STATUS_STYLE.healthy;
        const Icon = STATUS_ICON[m.status] ?? CheckCircle2;
        return (
          <div key={m.component} className={`rounded-xl border px-3 py-2.5 ${StyleCls}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">{m.component}</span>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex gap-3 text-[10px] text-slate-400">
              <span>{CAT_LABEL[m.category] ?? m.category}</span>
              <span>{m.successRatePct.toFixed(1)}% success</span>
              <span>{m.avgLatencyMs}ms</span>
              {m.errorCount24h > 0 && <span className="text-red-400">{m.errorCount24h} errors</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
