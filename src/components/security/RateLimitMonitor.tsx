"use client";
import { Ban, KeyRound, AlertOctagon, Globe } from "lucide-react";
import type { AbuseEvent } from "@/types";
import { getAbuseEvents } from "@/lib/security/audit-trail";

const TYPE_CONFIG: Record<AbuseEvent["type"], { icon: React.ElementType; label: string; color: string; bg: string; border: string }> = {
  rate_limit_exceeded: { icon: AlertOctagon, label: "Rate Limit",       color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  invalid_key:         { icon: KeyRound,     label: "Invalid Key",      color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  suspicious_pattern:  { icon: Ban,          label: "Suspicious",       color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  geo_block:           { icon: Globe,        label: "Geo Block",        color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function RateLimitMonitor() {
  const events = getAbuseEvents();
  const blocked = events.filter((e) => e.blocked).length;
  const totalRequests = events.reduce((s, e) => s + e.count, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{events.length}</p>
          <p className="text-xs text-slate-400">Abuse Events</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-red-400">{blocked}</p>
          <p className="text-xs text-slate-400">Blocked IPs</p>
        </div>
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-yellow-400">{totalRequests.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Blocked Reqs</p>
        </div>
      </div>

      <div className="space-y-2">
        {events.map((ev, i) => {
          const cfg = TYPE_CONFIG[ev.type];
          const Icon = cfg.icon;
          return (
            <div key={i} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${cfg.bg} ${cfg.border}`}>
              <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  {ev.blocked && (
                    <span className="rounded-full bg-red-500/20 border border-red-500/30 px-1.5 text-[10px] text-red-400 uppercase">blocked</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{ev.endpoint}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                  <span>{ev.ipAddress}</span>
                  <span>{ev.count.toLocaleString()} requests</span>
                  <span>{formatRelative(ev.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
