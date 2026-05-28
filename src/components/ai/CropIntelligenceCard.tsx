"use client";

import { Leaf, ChevronRight, TrendingUp, Sun, Droplets, Sprout } from "lucide-react";
import type { CropPrediction } from "@/types";

const SEASON_CONFIG = {
  kharif:    { label: "Kharif",    color: "text-green-400",   icon: Droplets, desc: "Jun–Nov" },
  rabi:      { label: "Rabi",      color: "text-blue-400",    icon: Sun,      desc: "Oct–Apr" },
  zaid:      { label: "Zaid",      color: "text-yellow-400",  icon: Sun,      desc: "Mar–Jun" },
  perennial: { label: "Perennial", color: "text-emerald-400", icon: Sprout,   desc: "Year-round" },
};

function cropLabel(crop: string): string {
  return crop.charAt(0).toUpperCase() + crop.slice(1);
}

interface CropIntelligenceCardProps {
  prediction: CropPrediction | null;
  loading?: boolean;
}

export function CropIntelligenceCard({ prediction, loading }: CropIntelligenceCardProps) {
  if (loading) {
    return <div className="h-32 rounded-2xl bg-muted animate-pulse" />;
  }
  if (!prediction) return null;

  const season = SEASON_CONFIG[prediction.seasonalAlignment];
  const SeasonIcon = season.icon;
  const barWidth = prediction.signatureMatch * 100;

  return (
    <div className="space-y-3">
      {/* Prediction header */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-green-500/20 bg-green-500/5">
        <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{cropLabel(prediction.predictedCrop)}</p>
          <div className="flex items-center gap-2 text-[11px]">
            <SeasonIcon className={`w-3 h-3 ${season.color}`} />
            <span className={season.color}>{season.label}</span>
            <span className="text-muted-foreground/40">({season.desc})</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-400">{prediction.confidence}%</p>
          <p className="text-[10px] text-muted-foreground/40">confidence</p>
        </div>
      </div>

      {/* Signature match bar */}
      <div>
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-muted-foreground/60 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" /> NDVI Signature Match
          </span>
          <span className="text-foreground font-medium">{(prediction.signatureMatch * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500/60 to-emerald-400/80 transition-all"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Alternative crops */}
      <div className="space-y-1">
        <p className="text-[11px] text-muted-foreground/50 font-medium">Alternatives</p>
        {prediction.alternativeCrops.slice(0, 3).map((alt) => (
          <div key={alt.crop} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/20">
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            <span className="flex-1 text-xs text-muted-foreground/70">{cropLabel(alt.crop)}</span>
            <span className="text-[11px] text-muted-foreground/50">{alt.confidence}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
