"use client";

import { useState, useEffect } from "react";
import { CloudRain, Thermometer, Droplets, Wind, RefreshCw } from "lucide-react";
import type { WeatherData } from "@/lib/monitoring/weather-engine";
import { interpretWeather } from "@/lib/monitoring/weather-engine";

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  farmId?: string;
  userId?: string;
}

export function WeatherWidget({ lat, lng, farmId, userId }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch("/api/monitoring/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, farmId, userId }),
    })
      .then((r) => r.json())
      .then((data: WeatherData) => {
        if (!cancelled) {
          if (data && "rainfall7d" in data) {
            setWeather(data);
          } else {
            setError(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lat, lng, farmId, userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/50 py-3">
        <Wind className="w-3.5 h-3.5" />
        Weather data temporarily unavailable
      </div>
    );
  }

  const droughtColor =
    weather.droughtScore >= 70
      ? "text-red-400"
      : weather.droughtScore >= 40
      ? "text-yellow-400"
      : "text-green-400";

  const heatColor =
    weather.heatStressScore >= 60
      ? "text-red-400"
      : weather.heatStressScore >= 30
      ? "text-orange-400"
      : "text-blue-400";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            icon: CloudRain,
            label: "Rainfall (7d)",
            value: `${weather.rainfall7d} mm`,
            sub: weather.forecastRain3d > 0 ? `+${weather.forecastRain3d}mm forecast` : "No rain forecast",
            color: weather.rainfall7d < 5 ? "text-red-400" : "text-blue-400",
          },
          {
            icon: Thermometer,
            label: "Max Temp",
            value: `${weather.avgMaxTemp}°C`,
            sub: `Min ${weather.avgMinTemp}°C`,
            color: heatColor,
          },
          {
            icon: Droplets,
            label: "Moisture Deficit",
            value: `${weather.moistureDeficit} mm`,
            sub: `ET₀ ${weather.avgET0} mm/d`,
            color: weather.moistureDeficit > 20 ? "text-orange-400" : "text-green-400",
          },
          {
            icon: Wind,
            label: "Drought Score",
            value: `${weather.droughtScore}/100`,
            sub: interpretWeather(weather),
            color: droughtColor,
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-2.5 rounded-xl bg-muted border border-border"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3 h-3 ${s.color}`} />
                <p className="text-[10px] text-muted-foreground/50">{s.label}</p>
              </div>
              <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground/40 mt-0.5 truncate">{s.sub}</p>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
        <RefreshCw className="w-2.5 h-2.5" />
        Open-Meteo · {new Date(weather.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
