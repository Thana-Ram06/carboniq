"use client";
import { AlertCircle, CheckCircle, Clock, Minus } from "lucide-react";
import type { IncidentSeverity, IncidentStatus } from "@/types";
import { getIncidentHistory } from "@/lib/observability/incident-tracker";

const SEV_CONFIG: Record<IncidentSeverity, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low:      { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
};

const STATUS_ICON: Record<IncidentStatus, React.ElementType> = {
  open: AlertCircle,
  investigating: Clock,
  mitigated: Minus,
  resolved: CheckCircle,
};

const STATUS_COLOR: Record<IncidentStatus, string> = {
  open: "text-red-400",
  investigating: "text-yellow-400",
  mitigated: "text-blue-400",
  resolved: "text-green-400",
};

function mttrLabel(minutes?: number): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function IncidentLog() {
  const incidents = getIncidentHistory();
  const open = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div className="space-y-3">
      {open > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-medium">{open} active incident{open > 1 ? "s" : ""} require attention</p>
        </div>
      )}

      <div className="space-y-2">
        {incidents.map((inc) => {
          const sevCfg = SEV_CONFIG[inc.severity];
          const StatusIcon = STATUS_ICON[inc.status];
          return (
            <div key={inc.id} className={`rounded-xl border p-4 ${sevCfg.bg} ${sevCfg.border}`}>
              <div className="flex items-start gap-3">
                <StatusIcon className={`h-4 w-4 shrink-0 mt-0.5 ${STATUS_COLOR[inc.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-white">{inc.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium uppercase ${sevCfg.color} ${sevCfg.border}`}>
                      {inc.severity}
                    </span>
                    <span className={`text-xs capitalize ${STATUS_COLOR[inc.status]}`}>{inc.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{inc.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>{inc.id}</span>
                    <span>{new Date(inc.startedAt).toLocaleDateString()}</span>
                    {inc.mttrMinutes && <span>MTTR: {mttrLabel(inc.mttrMinutes)}</span>}
                    <span>Components: {inc.affectedComponents.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
