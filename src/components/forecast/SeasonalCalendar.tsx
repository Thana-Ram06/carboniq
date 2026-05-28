"use client";
import { Calendar, TrendingUp, AlertTriangle, Cloud } from "lucide-react";
import { computeSeasonalIntelligence, computeCropProductivityForecast } from "@/lib/forecast/seasonal-analyzer";
import { getSeasonalForecast } from "@/lib/integrations/imd-weather";
import type { CropType } from "@/types";

const OUTLOOK_COLOR = {
  "above-normal": "text-green-400 bg-green-500/10",
  "normal":       "text-blue-400 bg-blue-500/10",
  "below-normal": "text-red-400 bg-red-500/10",
};

interface Props { state: string; cropType?: CropType }

export function SeasonalCalendar({ state, cropType = "rice" }: Props) {
  const imd = getSeasonalForecast(state);
  const seasonal = computeSeasonalIntelligence(state, imd.rainfallDeparturePct);
  const productivity = computeCropProductivityForecast(cropType, state, "canal");

  const yieldColor = productivity.forecastYieldTha >= productivity.nationalBenchmarkTha
    ? "text-green-400" : "text-yellow-400";

  return (
    <div className="space-y-4">
      {/* Season Header */}
      <div className="rounded-xl border border-white/5 bg-white/3 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-white">{seasonal.season} {seasonal.year}</p>
              <p className="text-xs text-slate-400">{state}</p>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${OUTLOOK_COLOR[seasonal.rainfallOutlook]}`}>
            Rainfall {seasonal.rainfallOutlook.replace("-", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-white/5 p-2.5">
            <p className="text-slate-400 mb-1">Sowing Window</p>
            <p className="text-white font-medium">{seasonal.sowingWindowStart.split(" ").slice(1).join(" ")}</p>
            <p className="text-slate-400">→ {seasonal.sowingWindowEnd.split(" ").slice(1).join(" ")}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5">
            <p className="text-slate-400 mb-1">Harvest Window</p>
            <p className="text-white font-medium">{seasonal.harvestWindowStart.split(" ").slice(1).join(" ")}</p>
            <p className="text-slate-400">→ {seasonal.harvestWindowEnd.split(" ").slice(1).join(" ")}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5">
            <p className="text-slate-400 mb-1">Peak Growth</p>
            <p className="text-white font-medium">{seasonal.peakGrowthMonth}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5">
            <p className="text-slate-400 mb-1">Yield Index</p>
            <p className={`font-medium ${seasonal.projectedYieldIndex >= 1 ? "text-green-400" : "text-yellow-400"}`}>
              {(seasonal.projectedYieldIndex * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* IMD Forecast */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="h-4 w-4 text-blue-400" />
          <p className="text-sm font-semibold text-blue-300">IMD Seasonal Forecast</p>
          <span className="text-xs text-slate-400">Issued {imd.issuedDate}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: "Rainfall Departure", value: `${imd.rainfallDeparturePct > 0 ? "+" : ""}${imd.rainfallDeparturePct}%` },
            { label: "Temp. Anomaly",      value: `${imd.temperatureAnomalyC > 0 ? "+" : ""}${imd.temperatureAnomalyC}°C` },
            { label: "Drought Risk",       value: `${imd.droughtProbability}%` },
            { label: "Flood Risk",         value: `${imd.floodProbability}%` },
            { label: "Confidence",         value: `${imd.forecastConfidence}%` },
            { label: "Season",             value: imd.season },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-white/5 p-2">
              <p className="text-slate-400">{label}</p>
              <p className="font-medium text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Crop Productivity */}
      <div className="rounded-xl border border-white/5 bg-white/3 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-semibold text-white capitalize">{cropType} Productivity Forecast</p>
          </div>
          <span className={`text-sm font-bold ${yieldColor}`}>
            {productivity.forecastYieldTha} t/ha
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-white/5 p-2">
            <p className="text-slate-400">National Benchmark</p>
            <p className="font-medium text-white">{productivity.nationalBenchmarkTha} t/ha</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <p className="text-slate-400">Performance Index</p>
            <p className={`font-medium ${productivity.performanceIndex >= 1 ? "text-green-400" : "text-yellow-400"}`}>
              {(productivity.performanceIndex * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <p className="text-slate-400">Confidence</p>
            <p className="font-medium text-white">{productivity.forecastConfidence}%</p>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {seasonal.riskFactors.length > 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <p className="text-xs font-semibold text-yellow-300">Risk Factors This Season</p>
          </div>
          <ul className="space-y-1">
            {seasonal.riskFactors.map((r) => (
              <li key={r} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-yellow-400 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Crops */}
      <div>
        <p className="text-xs text-slate-400 mb-2">Recommended for {seasonal.season}</p>
        <div className="flex gap-2 flex-wrap">
          {seasonal.recommendedCrops.map((crop) => (
            <span key={crop} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-300 capitalize">
              {crop}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
