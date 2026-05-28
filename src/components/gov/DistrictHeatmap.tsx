import { getDistrictMonitors } from "@/lib/gov/regional-monitor";

function riskColor(score: number): string {
  if (score <= 30) return "bg-green-500";
  if (score <= 55) return "bg-yellow-500";
  if (score <= 75) return "bg-orange-500";
  return "bg-red-500";
}

function riskTextColor(score: number): string {
  if (score <= 30) return "text-green-400";
  if (score <= 55) return "text-yellow-400";
  if (score <= 75) return "text-orange-400";
  return "text-red-400";
}

export function DistrictHeatmap() {
  const districts = getDistrictMonitors();
  const sorted = [...districts].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-green-500 inline-block" />Low (0–30)</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-yellow-500 inline-block" />Moderate (31–55)</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-orange-500 inline-block" />High (56–75)</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-500 inline-block" />Critical (76+)</span>
      </div>

      <div className="space-y-2">
        {sorted.map((d) => (
          <div key={`${d.district}-${d.state}`} className="rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-xs font-semibold text-white">{d.district}</span>
                <span className="text-[10px] text-slate-500 ml-1">· {d.state}</span>
              </div>
              <span className={`text-xs font-bold ${riskTextColor(d.riskScore)}`}>{d.riskScore}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-1.5">
              <div
                className={`h-1.5 rounded-full ${riskColor(d.riskScore)} transition-all duration-300`}
                style={{ width: `${d.riskScore}%` }}
              />
            </div>
            <div className="flex gap-3 text-[10px] text-slate-500">
              <span>NDVI {d.avgNdvi.toFixed(2)}</span>
              <span>{d.dominantCrop}</span>
              <span>Rain {d.rainfallMm.toFixed(0)}mm</span>
              <span>Soil {(d.soilMoistureIndex * 100).toFixed(0)}%</span>
              <span>{d.farmCount} farms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
