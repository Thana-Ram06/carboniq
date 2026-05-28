"use client";
import { CloudRain, Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { computeDroughtForecast } from "@/lib/forecast/drought-predictor";
import type { DroughtSeverity } from "@/types";

const SEVERITY_CONFIG: Record<DroughtSeverity, { color: string; bg: string; border: string; label: string }> = {
  none:     { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  label: "No Drought" },
  mild:     { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   label: "Mild Drought" },
  moderate: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Moderate Drought" },
  severe:   { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Severe Drought" },
  extreme:  { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    label: "Extreme Drought" },
};

interface Props { regionName: string; state: string; avgNDVI?: number }

export function DroughtForecastPanel({ regionName, state, avgNDVI }: Props) {
  const forecast = computeDroughtForecast(regionName, state, avgNDVI);
  const cfg = SEVERITY_CONFIG[forecast.severity];
  const horizons = [
    { label: "30-Day", value: forecast.horizon30DayPct },
    { label: "60-Day", value: forecast.horizon60DayPct },
    { label: "90-Day", value: forecast.horizon90DayPct },
  ];

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CloudRain className={`h-5 w-5 ${cfg.color}`} />
          <div>
            <p className="text-sm font-semibold text-white">Drought Forecast</p>
            <p className="text-xs text-slate-400">{regionName} · {state}</p>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color} ${cfg.border} bg-black/20`}>
          {cfg.label}
        </span>
      </div>

      {/* Multi-Horizon Probabilities */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {horizons.map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-black/20 p-2 text-center">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-lg font-bold mt-0.5 ${value > 50 ? "text-orange-400" : value > 30 ? "text-yellow-400" : "text-green-400"}`}>
              {value}%
            </p>
            <div className="mt-1 h-1 w-full rounded-full bg-slate-700">
              <div
                className={`h-full rounded-full ${value > 50 ? "bg-orange-500" : value > 30 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { icon: Thermometer, label: "SPEI Index",        value: forecast.currentSPEI.toFixed(2) },
          { icon: CloudRain,   label: "Rainfall Deficit",  value: `${forecast.rainfallDeficitMm} mm` },
          { icon: Droplets,    label: "Soil Moisture Δ",   value: forecast.soilMoistureAnomaly.toFixed(3) },
          { icon: AlertTriangle, label: "Crop Stress",     value: `${(forecast.cropStressIndex * 100).toFixed(0)}%` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 rounded-lg bg-black/20 p-2">
            <Icon className={`h-3.5 w-3.5 ${cfg.color} shrink-0`} />
            <div>
              <p className="text-slate-400">{label}</p>
              <p className="font-medium text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Forecast confidence: {forecast.confidence}% · Issued: {forecast.forecastDate}
      </p>
    </div>
  );
}
