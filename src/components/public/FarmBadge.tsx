import { ShieldCheck, Award } from "lucide-react";
import type { SustainabilityTier } from "@/types";
import { getTierConfig } from "@/lib/public/farm-portal";

interface FarmBadgeProps {
  tier: SustainabilityTier;
  verificationStatus: "verified" | "pending" | "unverified";
  badges: string[];
  carbonCredits: number;
  confidenceLevel: number;
}

export function FarmBadge({ tier, verificationStatus, badges, carbonCredits, confidenceLevel }: FarmBadgeProps) {
  const tierCfg = getTierConfig(tier);

  return (
    <div className="space-y-3">
      <div className={`rounded-2xl border ${tierCfg.border} ${tierCfg.bg} px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Award className={`h-8 w-8 ${tierCfg.color}`} />
          <div>
            <p className={`text-lg font-bold ${tierCfg.color}`}>{tierCfg.label}</p>
            <p className="text-xs text-slate-400">Sustainability Tier</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{carbonCredits}</p>
          <p className="text-xs text-slate-400">Carbon Credits</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-2.5">
        <ShieldCheck className={`h-4 w-4 ${verificationStatus === "verified" ? "text-green-400" : "text-yellow-400"}`} />
        <span className="text-sm font-medium text-white capitalize">{verificationStatus}</span>
        <span className="ml-auto text-xs text-slate-400">{confidenceLevel}% confidence</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span key={badge} className="rounded-full border border-slate-600 bg-slate-700/40 px-3 py-1 text-xs font-medium text-slate-300">
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
