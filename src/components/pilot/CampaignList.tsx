"use client";

import { Flag, MapPin, Target, CheckCircle2, Clock, XCircle, PlayCircle } from "lucide-react";
import type { FieldCampaign, CampaignStatus } from "@/types";

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; icon: typeof Flag }> = {
  planned:   { label: "Planned",   color: "text-blue-400",    icon: Clock },
  active:    { label: "Active",    color: "text-green-400",   icon: PlayCircle },
  completed: { label: "Completed", color: "text-emerald-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-400",     icon: XCircle },
};

interface CampaignListProps {
  campaigns: FieldCampaign[];
  loading?: boolean;
}

export function CampaignList({ campaigns, loading }: CampaignListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0,1,2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Flag className="w-6 h-6 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground/50">No campaigns yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {campaigns.map((campaign) => {
        const cfg = STATUS_CONFIG[campaign.status];
        const Icon = cfg.icon;
        const pct = campaign.targetFarms > 0
          ? Math.min(100, Math.round((campaign.completedFarms / campaign.targetFarms) * 100))
          : 0;
        return (
          <div
            key={campaign.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:border-green-500/10 transition-all"
          >
            <Icon className={`w-4 h-4 ${cfg.color} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-foreground truncate">{campaign.name}</p>
                <span className={`text-[10px] font-medium ${cfg.color} ml-2`}>{cfg.label}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50">{campaign.district}, {campaign.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-400/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground/40 flex-shrink-0">
                  {campaign.completedFarms}/{campaign.targetFarms}
                </span>
                <Target className="w-2.5 h-2.5 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
