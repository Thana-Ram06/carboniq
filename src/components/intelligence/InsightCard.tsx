import {
  TrendingUp,
  Droplets,
  Leaf,
  Calendar,
  TriangleAlert,
  Info,
  CheckCircle2,
  Hexagon,
} from "lucide-react";
import type { Insight, InsightSeverity, InsightType } from "@/types";

const SEVERITY_STYLES: Record<
  InsightSeverity,
  { bg: string; border: string; icon: string; dot: string }
> = {
  success: {
    bg: "bg-green-500/8",
    border: "border-green-500/20",
    icon: "text-green-400",
    dot: "bg-green-500",
  },
  info: {
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    dot: "bg-blue-500",
  },
  warning: {
    bg: "bg-yellow-500/8",
    border: "border-yellow-500/20",
    icon: "text-yellow-400",
    dot: "bg-yellow-500",
  },
  critical: {
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    icon: "text-red-400",
    dot: "bg-red-500",
  },
};

const TYPE_ICONS: Record<InsightType, React.ElementType> = {
  trend: TrendingUp,
  vegetation: Leaf,
  irrigation: Droplets,
  seasonal: Calendar,
  carbon: Hexagon,
  boundary: Info,
};

function SeverityIcon({ severity }: { severity: InsightSeverity }) {
  const Icon =
    severity === "success"
      ? CheckCircle2
      : severity === "critical" || severity === "warning"
      ? TriangleAlert
      : Info;
  const styles = SEVERITY_STYLES[severity];
  return <Icon className={`w-3.5 h-3.5 ${styles.icon} shrink-0`} />;
}

interface InsightCardProps {
  insight: Insight;
  compact?: boolean;
}

export function InsightCard({ insight, compact = false }: InsightCardProps) {
  const styles = SEVERITY_STYLES[insight.severity];
  const TypeIcon = TYPE_ICONS[insight.type] ?? Info;

  if (compact) {
    return (
      <div
        className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border ${styles.bg} ${styles.border}`}
      >
        <SeverityIcon severity={insight.severity} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground leading-snug">
            {insight.title}
          </p>
          {insight.metric && (
            <p className={`text-[10px] font-mono mt-0.5 ${styles.icon}`}>
              {insight.metric}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3.5 rounded-2xl border ${styles.bg} ${styles.border} space-y-2`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`w-7 h-7 rounded-lg ${styles.bg} border ${styles.border} flex items-center justify-center shrink-0 mt-0.5`}
        >
          <TypeIcon className={`w-3.5 h-3.5 ${styles.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">
              {insight.title}
            </p>
            {insight.metric && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${styles.bg} border ${styles.border} ${styles.icon}`}
              >
                {insight.metric}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  );
}
