"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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
    bg: "bg-green-500/8",
    border: "border-green-500/15",
    glow: "shadow-[0_0_20px_rgba(74,222,128,0.06)]",
    badge: "text-green-400 bg-green-500/10",
  },
  emerald: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/15",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.06)]",
    badge: "text-emerald-400 bg-emerald-500/10",
  },
  teal: {
    icon: "text-teal-400",
    bg: "bg-teal-500/8",
    border: "border-teal-500/15",
    glow: "shadow-[0_0_20px_rgba(45,212,191,0.06)]",
    badge: "text-teal-400 bg-teal-500/10",
  },
  yellow: {
    icon: "text-yellow-400",
    bg: "bg-yellow-500/8",
    border: "border-yellow-500/15",
    glow: "",
    badge: "text-yellow-400 bg-yellow-500/10",
  },
  blue: {
    icon: "text-blue-400",
    bg: "bg-blue-500/8",
    border: "border-blue-500/15",
    glow: "",
    badge: "text-blue-400 bg-blue-500/10",
  },
};

export function StatsCard({
  title,
  value,
  unit,
  change,
  changeLabel,
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "relative p-5 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-green-500/18 group",
        colors.glow
      )}
    >
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center border",
            colors.bg,
            colors.border
          )}
        >
          <Icon className={cn("w-4.5 h-4.5", colors.icon)} />
        </div>

        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium",
              isPositive
                ? "text-green-400 bg-green-500/10"
                : isNegative
                ? "text-red-400 bg-red-500/10"
                : "text-muted-foreground bg-muted"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground ml-1.5 font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-xs text-muted-foreground font-medium">{title}</p>

      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1.5">{description}</p>
      )}

      {changeLabel && (
        <p className="text-xs text-muted-foreground/70 mt-1">{changeLabel}</p>
      )}

      {/* Background shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(74,222,128,0.03),transparent_60%)]" />
    </motion.div>
  );
}
