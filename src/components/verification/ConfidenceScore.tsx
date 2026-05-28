"use client";

import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import type { ConfidenceScore } from "@/types";
import { confidenceLabelColor, confidenceLabelBg } from "@/lib/verification/confidence-engine";

interface ConfidenceScoreProps {
  score: ConfidenceScore;
  compact?: boolean;
}

export function ConfidenceScoreWidget({ score, compact = false }: ConfidenceScoreProps) {
  const color = confidenceLabelColor(score.label);
  const bg = confidenceLabelBg(score.label);
  const Icon = score.label === "Verified" ? ShieldCheck : score.label === "Insufficient" ? ShieldAlert : Shield;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${bg}`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`text-xs font-semibold ${color}`}>{score.label}</span>
        <span className="text-xs opacity-60">{score.overall}/100</span>
      </div>
    );
  }

  const bars = [
    { label: "NDVI Quality", value: score.ndviScore, max: 40 },
    { label: "Evidence", value: score.evidenceScore, max: 30 },
    { label: "Audit", value: score.auditScore, max: 25 },
    { label: "Consistency", value: score.consistencyScore, max: 15 },
  ];

  const circumference = 2 * Math.PI * 28;
  const dash = (score.overall / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Ring + label */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke={score.label === "Verified" ? "#10b981" : score.label === "High" ? "#4ade80" : score.label === "Medium" ? "#fbbf24" : score.label === "Low" ? "#f97316" : "#ef4444"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">{score.overall}</span>
            <span className="text-[9px] text-muted-foreground/50 -mt-0.5">/ 100</span>
          </div>
        </div>
        <div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${bg} ${color} mb-1`}>
            <Icon className="w-3.5 h-3.5" />
            {score.label}
          </div>
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            {score.breakdown.scansCompleted} scan{score.breakdown.scansCompleted !== 1 ? "s" : ""} ·{" "}
            {score.breakdown.evidenceValidated} evidence ·{" "}
            {score.breakdown.auditApproved ? "Audit approved" : "Awaiting audit"}
          </p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground/60">{b.label}</span>
              <span className="font-mono text-foreground">{b.value}/{b.max}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(b.value / b.max) * 100}%`,
                  background: b.value / b.max >= 0.7 ? "#4ade80" : b.value / b.max >= 0.4 ? "#fbbf24" : "#f97316",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
