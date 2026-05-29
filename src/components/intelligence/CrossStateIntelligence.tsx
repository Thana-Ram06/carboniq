import { AlertTriangle, Droplets, Leaf } from "lucide-react";
import { getDroughtRiskAggregations, getCropIntelligence } from "@/lib/intelligence/cross-state-aggregation";

const RISK_STYLE: Record<string, string> = {
  low: "text-green-400 bg-green-500/10 border-green-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
};

const HEALTH_STYLE: Record<string, string> = {
  excellent: "text-green-400",
  good: "text-blue-400",
  fair: "text-yellow-400",
  poor: "text-red-400",
};

export function CrossStateIntelligence() {
  const drought = getDroughtRiskAggregations();
  const crops = getCropIntelligence();
  const criticalZones = drought.filter((d) => d.riskLevel === "critical" || d.riskLevel === "high");

  return (
    <div className="space-y-4">
      {/* Drought alerts */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="h-4 w-4 text-orange-400" />
          <p className="text-sm font-semibold text-white">Drought Risk Zones</p>
          <span className="ml-auto text-[10px] text-slate-500">{criticalZones.length} high/critical</span>
        </div>
        <div className="space-y-1.5">
          {drought.slice(0, 6).map((d) => (
            <div key={`${d.district}-${d.state}`} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-[10px] ${RISK_STYLE[d.riskLevel] ?? RISK_STYLE.low}`}>
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span className="flex-1 font-medium">{d.district}, {d.state}</span>
              <span>{d.riskLevel.toUpperCase()}</span>
              <span>{d.affectedFarms} farms</span>
              <span>−{d.precipitationDeficit}% rain</span>
            </div>
          ))}
        </div>
      </div>

      {/* Crop intelligence */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-4 w-4 text-green-400" />
          <p className="text-sm font-semibold text-white">Crop Intelligence</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {crops.map((c) => (
            <div key={c.cropType} className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
              <p className="text-xs font-semibold text-white">{c.cropType}</p>
              <p className="text-[10px] text-slate-500">{c.season}</p>
              <p className={`text-[10px] font-medium mt-1 ${HEALTH_STYLE[c.healthStatus] ?? HEALTH_STYLE.fair}`}>{c.healthStatus}</p>
              <p className="text-[10px] text-slate-400">NDVI {c.avgNDVI} · {c.avgCarbonTha} t/ha</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
