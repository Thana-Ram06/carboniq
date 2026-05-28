"use client";

import { AlertTriangle, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { RiskAlert } from "@/types";
import Link from "next/link";

interface AlertStripProps {
  alerts: RiskAlert[];
  farmName?: string;
  farmId?: string;
}

export function AlertStrip({ alerts, farmName, farmId }: AlertStripProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || alerts.length === 0) return null;

  const criticals = alerts.filter((a) => a.severity === "critical");
  const highs = alerts.filter((a) => a.severity === "high");
  const top = criticals[0] ?? highs[0] ?? alerts[0];
  const isCritical = top.severity === "critical";

  return (
    <div
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-sm ${
        isCritical
          ? "bg-red-500/10 border-red-500/25 text-red-300"
          : "bg-orange-500/10 border-orange-500/25 text-orange-300"
      }`}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <p className="flex-1 truncate font-medium">
        {farmName && <span className="opacity-70 mr-1">{farmName}:</span>}
        {top.title}
        {alerts.length > 1 && (
          <span className="opacity-60 ml-2 text-xs">
            +{alerts.length - 1} more
          </span>
        )}
      </p>
      {farmId && (
        <Link href={`/farms/${farmId}`}>
          <button className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity shrink-0">
            View <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
