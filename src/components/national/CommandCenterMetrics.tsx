import { TrendingUp, TrendingDown } from "lucide-react";
import { getNationalCommandMetrics } from "@/lib/national/command-center";

const STATUS_STYLE: Record<string, string> = {
  healthy: "border-green-500/20 bg-green-500/10",
  warning: "border-yellow-500/20 bg-yellow-500/10",
  critical: "border-red-500/20 bg-red-500/10",
};
const VALUE_COLOR: Record<string, string> = {
  healthy: "text-green-400",
  warning: "text-yellow-400",
  critical: "text-red-400",
};

export function CommandCenterMetrics() {
  const metrics = getNationalCommandMetrics();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className={`rounded-xl border px-4 py-3 ${STATUS_STYLE[m.status] ?? STATUS_STYLE.healthy}`}>
          <p className={`text-2xl font-bold ${VALUE_COLOR[m.status] ?? VALUE_COLOR.healthy}`}>{m.value}</p>
          <p className="text-xs text-slate-400">{m.label}</p>
          <div className="flex items-center gap-1 mt-1">
            {m.trend >= 0
              ? <TrendingUp className="h-2.5 w-2.5 text-green-400" />
              : <TrendingDown className="h-2.5 w-2.5 text-red-400" />
            }
            <span className={`text-[9px] ${m.trend >= 0 ? "text-green-400" : "text-red-400"}`}>{Math.abs(m.trend)}% {m.trend >= 0 ? "↑" : "↓"}</span>
            <span className="text-[9px] text-slate-600">{m.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
