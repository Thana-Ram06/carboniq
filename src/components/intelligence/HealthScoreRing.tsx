import type { HealthScore } from "@/lib/intelligence/health-scoring";
import { healthColorClass } from "@/lib/intelligence/health-scoring";

interface HealthScoreRingProps {
  healthScore: HealthScore;
  size?: number;
  strokeWidth?: number;
}

export function HealthScoreRing({
  healthScore,
  size = 120,
  strokeWidth = 9,
}: HealthScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (healthScore.score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={healthScore.hex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.7s ease" }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-3xl font-bold tabular-nums ${healthColorClass(healthScore.color)}`}
          >
            {healthScore.score}
          </span>
          <span className="text-[10px] text-muted-foreground/50 font-medium">/ 100</span>
        </div>
      </div>
      <p className={`text-sm font-semibold ${healthColorClass(healthScore.color)}`}>
        {healthScore.label}
      </p>
    </div>
  );
}
