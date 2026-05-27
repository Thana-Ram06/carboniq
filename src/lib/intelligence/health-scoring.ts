export type HealthLabel = "Poor" | "Moderate" | "Healthy" | "Very Healthy" | "Excellent";
export type HealthColor = "red" | "orange" | "yellow" | "green" | "emerald";

export interface HealthScore {
  score: number;
  label: HealthLabel;
  color: HealthColor;
  hex: string;
  description: string;
}

const TIERS: Array<{
  min: number;
  label: HealthLabel;
  color: HealthColor;
  hex: string;
  score: (n: number) => number;
}> = [
  {
    min: 0.75,
    label: "Excellent",
    color: "emerald",
    hex: "#10b981",
    score: (n) => Math.round(88 + ((n - 0.75) / 0.25) * 12),
  },
  {
    min: 0.55,
    label: "Very Healthy",
    color: "green",
    hex: "#4ade80",
    score: (n) => Math.round(70 + ((n - 0.55) / 0.2) * 18),
  },
  {
    min: 0.35,
    label: "Healthy",
    color: "yellow",
    hex: "#fbbf24",
    score: (n) => Math.round(45 + ((n - 0.35) / 0.2) * 25),
  },
  {
    min: 0.15,
    label: "Moderate",
    color: "orange",
    hex: "#f97316",
    score: (n) => Math.round(20 + ((n - 0.15) / 0.2) * 25),
  },
  {
    min: 0,
    label: "Poor",
    color: "red",
    hex: "#ef4444",
    score: (n) => Math.round((n / 0.15) * 20),
  },
];

const DESCRIPTIONS: Record<HealthLabel, string> = {
  Poor: "Sparse or severely stressed vegetation detected",
  Moderate: "Below-average vegetation health, attention needed",
  Healthy: "Good vegetation coverage with stable health",
  "Very Healthy": "Strong vegetation density and active growth",
  Excellent: "Peak vegetation health and biomass density",
};

export function computeHealthScore(ndvi: number, trend?: number): HealthScore {
  const clamped = Math.max(0, Math.min(1, ndvi));
  const tier = TIERS.find((t) => clamped >= t.min) ?? TIERS[TIERS.length - 1];
  let score = tier.score(clamped);
  if (trend !== undefined) {
    score = Math.min(100, Math.max(0, score + Math.round(trend * 50)));
  }
  return {
    score,
    label: tier.label,
    color: tier.color,
    hex: tier.hex,
    description: DESCRIPTIONS[tier.label],
  };
}

export function healthColorClass(color: HealthColor): string {
  return {
    red: "text-red-400",
    orange: "text-orange-400",
    yellow: "text-yellow-400",
    green: "text-green-400",
    emerald: "text-emerald-400",
  }[color];
}

export function healthBgClass(color: HealthColor): string {
  return {
    red: "bg-red-500/10 border-red-500/20",
    orange: "bg-orange-500/10 border-orange-500/20",
    yellow: "bg-yellow-500/10 border-yellow-500/20",
    green: "bg-green-500/10 border-green-500/20",
    emerald: "bg-emerald-500/10 border-emerald-500/20",
  }[color];
}

export function healthRingColor(color: HealthColor): string {
  return {
    red: "#ef4444",
    orange: "#f97316",
    yellow: "#fbbf24",
    green: "#4ade80",
    emerald: "#10b981",
  }[color];
}
