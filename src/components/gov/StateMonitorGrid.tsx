import { AlertTriangle, CheckCircle, MapPin } from "lucide-react";
import { getStateMonitorSummaries } from "@/lib/gov/regional-monitor";

const DROUGHT_CONFIG = {
  low:      { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  dot: "bg-green-400" },
  moderate: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", dot: "bg-yellow-400" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", dot: "bg-orange-400" },
  critical: { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    dot: "bg-red-400" },
};

export function StateMonitorGrid() {
  const states = getStateMonitorSummaries();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {states.map((s) => {
        const dCfg = DROUGHT_CONFIG[s.droughtRiskLevel];
        return (
          <div key={s.state} className={`rounded-xl border p-4 ${dCfg.bg} ${dCfg.border}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dCfg.dot}`} />
                <span className="text-sm font-semibold text-white">{s.state}</span>
              </div>
              {s.alertCount > 0
                ? <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
                : <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
              }
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Active Farms</p>
                <p className="font-semibold text-white">{s.activeFarms.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Avg NDVI</p>
                <p className="font-semibold text-white">{s.avgNdviScore.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500">Carbon t/farm</p>
                <p className="font-semibold text-white">{s.avgCarbonScore.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-slate-500">Verified</p>
                <p className="font-semibold text-white">{s.verifiedFarms.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 text-[10px]">
              <span className={`capitalize font-medium ${dCfg.color}`}>{s.droughtRiskLevel} drought risk</span>
              {s.alertCount > 0 && <span className="text-yellow-400">{s.alertCount} alerts</span>}
              <span className="text-slate-500 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{s.lastScanDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
