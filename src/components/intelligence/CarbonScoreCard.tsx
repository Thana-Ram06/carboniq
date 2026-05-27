import { Leaf, Flame, Zap, TrendingUp } from "lucide-react";
import type { CarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";

interface CarbonScoreCardProps {
  carbon: CarbonIntelligence;
  compact?: boolean;
}

export function CarbonScoreCard({
  carbon,
  compact = false,
}: CarbonScoreCardProps) {
  const confidenceColor = {
    high: "text-green-400",
    medium: "text-yellow-400",
    low: "text-red-400",
  }[carbon.confidence];

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            icon: Flame,
            label: "CO₂e Est.",
            value: `${carbon.carbonScoreTonnes} t`,
            color: "text-orange-400",
          },
          {
            icon: Leaf,
            label: "Biomass",
            value: `${carbon.biomassGreenTonnes} t`,
            color: "text-green-400",
          },
          {
            icon: Zap,
            label: "Credits",
            value: `$${carbon.carbonCreditEstimate.toLocaleString()}`,
            color: "text-blue-400",
          },
          {
            icon: TrendingUp,
            label: "Sustain.",
            value: `${carbon.sustainabilityIndex}%`,
            color: "text-emerald-400",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-2.5 rounded-xl bg-muted border border-border"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className={`w-3 h-3 ${s.color}`} />
                <p className="text-[10px] text-muted-foreground/50">{s.label}</p>
              </div>
              <p className={`text-sm font-bold font-mono ${s.color}`}>
                {s.value}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-orange-500/8 border border-orange-500/15">
          <p className="text-[10px] text-muted-foreground/50 mb-1">
            CO₂e Sequestered
          </p>
          <p className="text-lg font-bold text-orange-400 font-mono">
            {carbon.carbonScoreTonnes}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              tonnes
            </span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/15">
          <p className="text-[10px] text-muted-foreground/50 mb-1">
            Green Biomass
          </p>
          <p className="text-lg font-bold text-green-400 font-mono">
            {carbon.biomassGreenTonnes}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              t/total
            </span>
          </p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-muted border border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground/60">Sustainability Index</p>
          <p className="text-xs font-bold text-foreground">
            {carbon.sustainabilityIndex}%
          </p>
        </div>
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-700"
            style={{ width: `${carbon.sustainabilityIndex}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/8 border border-blue-500/15">
        <div>
          <p className="text-[10px] text-muted-foreground/50">
            Carbon Credit Estimate
          </p>
          <p className="text-sm font-bold text-blue-400">
            ${carbon.carbonCreditEstimate.toLocaleString()}
            <span className="text-[10px] font-normal text-muted-foreground ml-1">
              @ $15/tCO₂e
            </span>
          </p>
        </div>
        <span
          className={`text-[10px] font-medium capitalize px-2 py-0.5 rounded-lg bg-card border border-border ${confidenceColor}`}
        >
          {carbon.confidence} confidence
        </span>
      </div>
    </div>
  );
}
