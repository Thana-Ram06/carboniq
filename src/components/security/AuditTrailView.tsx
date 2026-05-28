"use client";
import { ShieldAlert, Info, AlertTriangle } from "lucide-react";
import type { AuditEntry } from "@/types";
import { getAuditTrail } from "@/lib/security/audit-trail";

const SEV_CONFIG = {
  critical: { icon: ShieldAlert, color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  warning:  { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  info:     { icon: Info,          color: "text-slate-400",  bg: "bg-slate-700/30",  border: "border-slate-700" },
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function EventRow({ entry }: { entry: AuditEntry }) {
  const cfg = SEV_CONFIG[entry.severity];
  const SevIcon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${cfg.bg} ${cfg.border}`}>
      <SevIcon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-white capitalize">
            {entry.eventType.replace(/_/g, " ")}
          </span>
          {!entry.success && (
            <span className="rounded-full bg-red-500/20 border border-red-500/30 px-1.5 text-[10px] text-red-400 uppercase">failed</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{entry.email}</p>
        <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
          <span>{entry.resourceType}/{entry.resourceId}</span>
          {entry.ipAddress && <span>{entry.ipAddress}</span>}
          <span>{formatRelative(entry.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

export function AuditTrailView() {
  const entries = getAuditTrail(12);
  const critical = entries.filter((e) => e.severity === "critical").length;
  const warnings = entries.filter((e) => e.severity === "warning").length;

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{entries.length}</p>
          <p className="text-xs text-slate-400">Total Events</p>
        </div>
        <div className="flex-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-red-400">{critical}</p>
          <p className="text-xs text-slate-400">Critical</p>
        </div>
        <div className="flex-1 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-yellow-400">{warnings}</p>
          <p className="text-xs text-slate-400">Warnings</p>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {entries.map((entry) => (
          <EventRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
