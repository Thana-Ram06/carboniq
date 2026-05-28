import { TrendingUp, TrendingDown, Minus, Leaf } from "lucide-react";

interface PublicNDVICardProps {
  ndviScore: number;
  ndviTrend: "improving" | "stable" | "declining";
  carbonScoreTonnes: number;
  cropType: string;
  areaHectares: number;
  lastUpdated: string;
}

const TREND_CONFIG = {
  improving: { icon: TrendingUp,   color: "text-green-400",  label: "Improving" },
  stable:    { icon: Minus,        color: "text-yellow-400", label: "Stable" },
  declining: { icon: TrendingDown, color: "text-red-400",    label: "Declining" },
};

function ndviHealthLabel(score: number): string {
  if (score >= 0.7) return "Excellent";
  if (score >= 0.55) return "Good";
  if (score >= 0.4) return "Moderate";
  return "Poor";
}

function ndviColor(score: number): string {
  if (score >= 0.7) return "text-green-400";
  if (score >= 0.55) return "text-lime-400";
  if (score >= 0.4) return "text-yellow-400";
  return "text-red-400";
}

export function PublicNDVICard({ ndviScore, ndviTrend, carbonScoreTonnes, cropType, areaHectares, lastUpdated }: PublicNDVICardProps) {
  const trendCfg = TREND_CONFIG[ndviTrend];
  const TrendIcon = trendCfg.icon;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Leaf className="h-5 w-5 text-green-400" />
        <h3 className="text-base font-semibold text-white">Vegetation Health</h3>
        <span className="ml-auto text-xs text-slate-500">via Sentinel-2</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={`text-4xl font-bold tabular-nums ${ndviColor(ndviScore)}`}>{ndviScore.toFixed(3)}</p>
          <p className="text-xs text-slate-400 mt-1">NDVI Index · {ndviHealthLabel(ndviScore)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon className={`h-3.5 w-3.5 ${trendCfg.color}`} />
            <span className={`text-xs ${trendCfg.color}`}>{trendCfg.label}</span>
          </div>
        </div>
        <div>
          <p className="text-4xl font-bold text-white tabular-nums">{carbonScoreTonnes.toFixed(1)}</p>
          <p className="text-xs text-slate-400 mt-1">tCO₂e sequestered</p>
        </div>
      </div>

      <div className="w-full bg-slate-700/50 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 transition-all duration-300"
          style={{ width: `${Math.min(100, (ndviScore / 1.0) * 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>0.0 Bare</span><span>0.5 Moderate</span><span>1.0 Dense</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div className="rounded-lg border border-slate-700 bg-slate-700/20 px-2 py-2">
          <p className="font-semibold text-white">{cropType}</p>
          <p className="text-slate-500">Crop</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/20 px-2 py-2">
          <p className="font-semibold text-white">{areaHectares.toFixed(1)} ha</p>
          <p className="text-slate-500">Area</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/20 px-2 py-2">
          <p className="font-semibold text-white">{new Date(lastUpdated).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
          <p className="text-slate-500">Updated</p>
        </div>
      </div>
    </div>
  );
}
