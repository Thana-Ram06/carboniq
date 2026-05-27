"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect, useId } from "react";
import { cn } from "@/lib/utils";

// All four logo PNGs share the same canvas after content-aware crop + normalisation.
// Both themes render at identical pixel dimensions → zero layout shift on theme switch.

const LOGO = {
  full:    { w: 1370, h: 225 },
  compact: { w: 1370, h: 225 },
} as const;

// ── Full wordmark logo ──────────────────────────────────────────────────────

export interface VasudhaLogoProps {
  className?: string;
  /** Rendered height in px — width scales proportionally (same for both themes) */
  height?: number;
  /** Show the tagline beneath the wordmark (default true) */
  tagline?: boolean;
  /** Override theme detection */
  forceTheme?: "light" | "dark";
}

export function VasudhaLogo({
  className,
  height = 40,
  tagline = true,
  forceTheme,
}: VasudhaLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = forceTheme
    ? forceTheme === "dark"
    : !mounted || resolvedTheme === "dark";

  const variant = tagline ? "full" : "compact";
  const { w, h } = LOGO[variant];

  const src = isDark
    ? `/logo-dark${tagline ? "" : "-compact"}.png`
    : `/logo-light${tagline ? "" : "-compact"}.png`;

  // Derived rendered width — identical for both themes since canvases are the same size
  const renderedW = Math.round(height * w / h);

  return (
    // Fixed-size wrapper prevents any layout shift between themes
    <div
      style={{ width: renderedW, height, flexShrink: 0 }}
      className={cn("relative overflow-hidden select-none", className)}
    >
      <Image
        src={src}
        alt="VASUDHA"
        fill
        sizes={`${renderedW}px`}
        style={{ objectFit: "contain", objectPosition: "center" }}
        priority
      />
    </div>
  );
}

// ── Icon-only variant — SVG leaf + V for collapsed sidebar / favicon ────────

const ICON_LIGHT = { leaf1: "#22c55e", leaf2: "#15803d", leafVein: "#166534" };
const ICON_DARK  = { leaf1: "#4ade80", leaf2: "#22c55e", leafVein: "#16a34a" };

export interface VasudhaIconProps {
  className?: string;
  size?: number;
  forceTheme?: "light" | "dark";
}

export function VasudhaIcon({
  className,
  size = 32,
  forceTheme,
}: VasudhaIconProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const uid = useId().replace(/:/g, "");

  useEffect(() => setMounted(true), []);

  const isDark = forceTheme
    ? forceTheme === "dark"
    : !mounted || resolvedTheme === "dark";
  const c = isDark ? ICON_DARK : ICON_LIGHT;

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="VASUDHA"
    >
      <defs>
        <linearGradient id={`${uid}ig`} x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={c.leaf1} />
          <stop offset="100%" stopColor={c.leaf2} />
        </linearGradient>
      </defs>

      <circle
        cx="16" cy="16" r="15"
        fill={isDark ? "rgba(74,222,128,0.07)" : "rgba(22,163,74,0.07)"}
      />
      <path
        d="M 14 28 C 8 22, 3 14, 6 7 C 8 2, 16 0, 21 5 C 26 10, 24 19, 19 24 L 14 28 Z"
        fill={`url(#${uid}ig)`}
        opacity="0.92"
      />
      <path
        d="M 14 28 C 14 20, 13 11, 12 5"
        stroke={c.leafVein}
        strokeWidth="0.85"
        fill="none"
        opacity="0.40"
        strokeLinecap="round"
      />
      <text
        x="19" y="26"
        textAnchor="middle"
        fontFamily="'Montserrat', 'Inter', system-ui, sans-serif"
        fontWeight="900"
        fontSize="13"
        fill={isDark ? "rgba(236,253,245,0.88)" : "rgba(12,59,59,0.88)"}
      >
        V
      </text>
    </svg>
  );
}
