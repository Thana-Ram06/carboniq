import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getStateAggregations } from "@/lib/national/command-center";

const REGION_STYLE: Record<string, string> = {
  north: "border-blue-500/20 bg-blue-500/5",
  south: "border-green-500/20 bg-green-500/5",
  east: "border-purple-500/20 bg-purple-500/5",
  west: "border-orange-500/20 bg-orange-500/5",
  central: "border-yellow-500/20 bg-yellow-500/5",
  northeast: "border-pink-500/20 bg-pink-500/5",
};

export function StateAggregationMap() {
  const states = getStateAggregations();
  const byRegion = states.reduce<Record<string, typeof states>>((acc, s) => {
    (acc[s.region] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(byRegion).map(([region, regionStates]) => (
        <div key={region} className={`rounded-xl border px-4 py-3 ${REGION_STYLE[region] ?? REGION_STYLE.central}`}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 capitalize">{region} India</p>
          <div className="space-y-1.5">
            {regionStates.map((s) => (
              <div key={s.state} className="flex items-center gap-3">
                <span className="text-xs text-white w-36 flex-shrink-0">{s.state}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-700">
                  <div className="h-1.5 rounded-full bg-green-500/70" style={{ width: `${Math.min(100, s.verifiedFarmsPct).toFixed(0)}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 w-14 text-right">{s.activeFarms.toLocaleString()} farms</span>
                <span className="text-[10px] text-slate-500 w-12 text-right">NDVI {s.avgNDVI}</span>
                {s.alertCount > 5
                  ? <AlertTriangle className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                  : <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" />
                }
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
