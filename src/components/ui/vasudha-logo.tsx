"use client";

import { useTheme } from "next-themes";
import { useState, useEffect, useId } from "react";
import { cn } from "@/lib/utils";

// ── Color palettes ──────────────────────────────────────────────────────────

const LIGHT = {
  text: "#0c3b3b",
  textEnd: "#0a5e42",
  leaf1: "#22c55e",
  leaf2: "#15803d",
  leafVein: "#166534",
  globe: "#0284c7",
  globeInner: "#164e63",
  arc: "#0d9488",
  sat: "#0f766e",
  tagline: "#1e7a56",
  rule: "rgba(13,148,136,0.28)",
  dot: "#0d9488",
};

const DARK = {
  text: "#ecfdf5",
  textEnd: "#86efac",
  leaf1: "#4ade80",
  leaf2: "#22c55e",
  leafVein: "#16a34a",
  globe: "#38bdf8",
  globeInner: "#0ea5e9",
  arc: "#2dd4bf",
  sat: "#5eead4",
  tagline: "#6ee7b7",
  rule: "rgba(74,222,128,0.22)",
  dot: "#4ade80",
};

// ── Full wordmark logo ──────────────────────────────────────────────────────

export interface VasudhaLogoProps {
  className?: string;
  /** Rendered height in px — width scales automatically */
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
  // Unique per-instance prefix so multiple logos on the same page don't clash
  const uid = useId().replace(/:/g, "");

  useEffect(() => setMounted(true), []);

  const isDark = forceTheme
    ? forceTheme === "dark"
    : !mounted || resolvedTheme === "dark";
  const c = isDark ? DARK : LIGHT;

  // viewBox height grows when tagline is shown
  const vh = tagline ? 106 : 76;

  return (
    <svg
      viewBox={`0 0 380 ${vh}`}
      style={{ height, width: "auto" }}
      className={cn("shrink-0 select-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="VASUDHA — Earth Intelligence for a Sustainable Future"
    >
      <defs>
        {/* Leaf gradient — top bright, bottom deep */}
        <linearGradient id={`${uid}leaf`} x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={c.leaf1} />
          <stop offset="100%" stopColor={c.leaf2} />
        </linearGradient>

        {/* Wordmark gradient — subtle teal shift on the right edge */}
        <linearGradient id={`${uid}text`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor={c.text} />
          <stop offset="78%" stopColor={c.text} />
          <stop offset="100%" stopColor={c.textEnd} />
        </linearGradient>
      </defs>

      {/* ── Satellite orbit arc ───────────────────────────────────────────── */}
      <path
        d="M 72 46 Q 191 2 312 30"
        stroke={c.arc}
        strokeWidth="1.25"
        fill="none"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* ── Satellite icon ────────────────────────────────────────────────── */}
      <g transform="translate(306,21) rotate(-14)">
        {/* Body */}
        <rect x="0" y="0" width="10" height="6" rx="1.5" fill={c.sat} />
        {/* Left solar panel */}
        <rect x="-8.5" y="1.2" width="7.5" height="3.5" rx="1" fill={c.sat} opacity="0.65" />
        {/* Right solar panel */}
        <rect x="10.5" y="1.2" width="7.5" height="3.5" rx="1" fill={c.sat} opacity="0.65" />
        {/* Antenna */}
        <line x1="8" y1="0" x2="11" y2="-4" stroke={c.sat} strokeWidth="1" strokeLinecap="round" />
        {/* Dish cup */}
        <path
          d="M 9.5,-5 Q 13,-3.5 13,0"
          stroke={c.arc}
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
      {/* Signal arcs */}
      <path d="M 320 17 Q 327 13 325  8" stroke={c.arc} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.50" />
      <path d="M 323 16 Q 332 11 329  5" stroke={c.arc} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.30" />

      {/* ── Main leaf (overlapping V left stroke) ─────────────────────────── */}
      <path
        d="M 40 72
           C 31 62, 20 49, 23 33
           C 25 20, 37 12, 48 18
           C 58 24, 60 39, 54 53
           C 49 64, 43 69, 40 72 Z"
        fill={`url(#${uid}leaf)`}
        opacity="0.93"
      />
      {/* Central vein */}
      <path
        d="M 40 72 C 38 55, 37 37, 34 20"
        stroke={c.leafVein}
        strokeWidth="0.8"
        fill="none"
        opacity="0.38"
        strokeLinecap="round"
      />
      {/* Secondary leaf (inner V area) */}
      <path
        d="M 62 65
           C 57 56, 60 43, 68 38
           C 74 34, 79 39, 77 49
           C 74 57, 67 62, 62 65 Z"
        fill={`url(#${uid}leaf)`}
        opacity="0.60"
      />

      {/* ── VASUDHA wordmark ──────────────────────────────────────────────── */}
      <text
        x="196"
        y="71"
        textAnchor="middle"
        fontFamily="'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="900"
        fontSize="57"
        letterSpacing="-1.5"
        fill={`url(#${uid}text)`}
      >
        VASUDHA
      </text>

      {/* ── Globe (right, last-A area) ────────────────────────────────────── */}
      {/* Ambient glow */}
      <circle cx="350" cy="49" r="12" fill={c.globe} opacity="0.07" />
      {/* Outer ring */}
      <circle cx="350" cy="49" r="9.5" fill="none" stroke={c.globe} strokeWidth="1.35" opacity="0.72" />
      {/* Equatorial ellipse */}
      <ellipse cx="350" cy="49" rx="9.5" ry="5" fill="none" stroke={c.globeInner} strokeWidth="0.75" opacity="0.48" />
      {/* Prime meridian arc */}
      <path d="M 350 39.5 Q 353.5 49 350 58.5" fill="none" stroke={c.globeInner} strokeWidth="0.75" opacity="0.48" />
      {/* Equatorial highlight */}
      <path d="M 340.5 49 Q 350 45.5 359.5 49" fill="none" stroke={c.globe} strokeWidth="0.9" opacity="0.33" />

      {/* ── Tagline ───────────────────────────────────────────────────────── */}
      {tagline && (
        <g>
          <line x1="28"  y1="91" x2="108" y2="91" stroke={c.rule} strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="115" cy="91" r="1.5" fill={c.dot} opacity="0.60" />
          <text
            x="191"
            y="94.5"
            textAnchor="middle"
            fontFamily="'Inter', system-ui, sans-serif"
            fontWeight="500"
            fontSize="7.8"
            letterSpacing="2.2"
            fill={c.tagline}
          >
            EARTH INTELLIGENCE FOR A SUSTAINABLE FUTURE
          </text>
          <circle cx="267" cy="91" r="1.5" fill={c.dot} opacity="0.60" />
          <line x1="274" y1="91" x2="352" y2="91" stroke={c.rule} strokeWidth="0.9" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// ── Icon-only variant (leaf + V initial) for favicon / collapsed sidebar ───

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
  const c = isDark ? DARK : LIGHT;

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

      {/* Subtle ambient ring */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill={isDark ? "rgba(74,222,128,0.07)" : "rgba(22,163,74,0.07)"}
      />

      {/* Leaf blade */}
      <path
        d="M 14 28
           C  8 22,  3 14,  6  7
           C  8  2, 16  0, 21  5
           C 26 10, 24 19, 19 24
           L 14 28 Z"
        fill={`url(#${uid}ig)`}
        opacity="0.92"
      />
      {/* Leaf midrib */}
      <path
        d="M 14 28 C 14 20, 13 11, 12 5"
        stroke={c.leafVein}
        strokeWidth="0.85"
        fill="none"
        opacity="0.40"
        strokeLinecap="round"
      />

      {/* V initial mark */}
      <text
        x="19"
        y="26"
        textAnchor="middle"
        fontFamily="'Inter', system-ui, sans-serif"
        fontWeight="900"
        fontSize="13"
        fill={isDark ? "rgba(236,253,245,0.88)" : "rgba(12,59,59,0.88)"}
      >
        V
      </text>
    </svg>
  );
}
