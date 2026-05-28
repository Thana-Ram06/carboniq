import { TriangleAlert, Droplets, Flame, TrendingDown, Zap, Info } from "lucide-react";
import { riskSeverityBg } from "@/lib/monitoring/risk-engine";
import type { RiskAlert, RiskSeverity } from "@/types";

const TYPE_ICONS: Record<string, React.ElementType> = {
  drought: Droplets,
  heat_stress: Flame,
  vegetation_decline: TrendingDown,
  irrigation_stress: Zap,
  anomaly: TriangleAlert,
  seasonal_lag: Info,
};

interface RiskAlertCardProps {
  alert: RiskAlert;
  compact?: boolean;
}

export function RiskAlertCard({ alert, compact = false }: RiskAlertCardProps) {
  const styles = riskSeverityBg(alert.severity as RiskSeverity);
  const Icon = TYPE_ICONS[alert.type] ?? TriangleAlert;

  if (compact) {
    return (
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${styles}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <p className="text-xs font-medium flex-1 truncate">{alert.title}</p>
        {alert.metric && (
          <span className="text-[10px] font-mono opacity-70 shrink-0">{alert.metric}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-2xl border ${styles} space-y-1.5`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 shrink-0" />
        <div className="flex-1 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{alert.title}</p>
          {alert.metric && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/20 shrink-0">
              {alert.metric}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs opacity-80 leading-relaxed pl-6">{alert.description}</p>
    </div>
  );
}

interface RiskScoreBadgeProps {
  score: number;
  severity: RiskSeverity;
  size?: "sm" | "md";
}

export function RiskScoreBadge({ score, severity, size = "md" }: RiskScoreBadgeProps) {
  const styles = riskSeverityBg(severity);
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${styles} ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "currentColor" }}
      />
      <span className="font-semibold capitalize">{severity}</span>
      <span className="opacity-60">Risk {score}</span>
    </div>
  );
}
