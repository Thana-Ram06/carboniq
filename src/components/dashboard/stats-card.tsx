"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: "green" | "emerald" | "teal" | "yellow" | "blue";
  description?: string;
  index?: number;
}

const COLOR_MAP = {
  green: {
    icon: "text-green-400",
    iconBg: "bg-green-500/8 border-green-500/15",
    badge: "text-green-400 bg-green-500/8",
    accent: "rgba(74,222,128,0.06)",
  },
  emerald: {
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/8 border-emerald-500/15",
    badge: "text-emerald-400 bg-emerald-500/8",
    accent: "rgba(52,211,153,0.06)",
  },
  teal: {
    icon: "text-teal-400",
    iconBg: "bg-teal-500/8 border-teal-500/15",
    badge: "text-teal-400 bg-teal-500/8",
    accent: "rgba(45,212,191,0.06)",
  },
  yellow: {
    icon: "text-yellow-400",
    iconBg: "bg-yellow-500/8 border-yellow-500/15",
    badge: "text-yellow-400 bg-yellow-500/8",
    accent: "rgba(234,179,8,0.06)",
  },
  blue: {
    icon: "text-blue-400",
    iconBg: "bg-blue-500/8 border-blue-500/15",
    badge: "text-blue-400 bg-blue-500/8",
    accent: "rgba(59,130,246,0.06)",
  },
};

export function StatsCard({
  title,
  value,
  unit,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  color = "green",
  description,
  index = 0,
}: StatsCardProps) {
  const colors = COLOR_MAP[color];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="relative p-5 rounded-2xl border border-border bg-card overflow-hidden group hover:border-green-500/20 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
    >
      {/* Top row: icon + change badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", colors.iconBg)}>
          <Icon className={cn("w-4 h-4", colors.icon)} />
        </div>

        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
              isPositive
                ? "text-green-400 bg-green-500/8"
                : isNegative
                ? "text-red-400 bg-red-500/8"
                : "text-muted-foreground bg-muted"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {isPositive ? "+" : ""}
            {change}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-foreground tracking-tight leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground font-normal">{unit}</span>
        )}
      </div>

      {/* Label */}
      <p className="text-xs font-medium text-muted-foreground">{title}</p>

      {/* Sub-text */}
      {(description || (change !== undefined && changeLabel)) && (
        <p className="text-xs text-muted-foreground/50 mt-1.5">
          {description ?? changeLabel}
        </p>
      )}

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top right, ${colors.accent}, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}
