"use client";
import { CheckCircle, Loader2, XCircle, Clock } from "lucide-react";
import type { BackupSnapshot, BackupStatusType } from "@/types";
import { getBackupHistory, getBackupMetrics, getRecoveryPoints } from "@/lib/backup/snapshot-engine";

const STATUS_CONFIG: Record<BackupStatusType, { icon: React.ElementType; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-green-400", label: "Completed" },
  running:   { icon: Loader2,     color: "text-blue-400",  label: "Running" },
  failed:    { icon: XCircle,     color: "text-red-400",   label: "Failed" },
  scheduled: { icon: Clock,       color: "text-slate-400", label: "Scheduled" },
  partial:   { icon: Clock,       color: "text-yellow-400",label: "Partial" },
};

const TYPE_BADGE: Record<BackupSnapshot["type"], string> = {
  full:        "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  incremental: "bg-slate-700/50 text-slate-300 border-slate-600",
  collection:  "bg-teal-500/20 text-teal-300 border-teal-500/30",
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function BackupStatus() {
  const snapshots = getBackupHistory(6);
  const metrics = getBackupMetrics();
  const recoveryPoints = getRecoveryPoints();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2">
          <p className="text-lg font-bold text-green-400">{metrics.successRate}%</p>
          <p className="text-xs text-slate-400">Success Rate</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2">
          <p className="text-lg font-bold text-white">{metrics.totalSizeGb.toFixed(1)} GB</p>
          <p className="text-xs text-slate-400">Total Stored</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2">
          <p className="text-sm font-bold text-blue-400">{metrics.rpo}</p>
          <p className="text-xs text-slate-400">RPO Target</p>
        </div>
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2">
          <p className="text-sm font-bold text-purple-400">{metrics.rto}</p>
          <p className="text-xs text-slate-400">RTO Target</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent Snapshots</p>
        <div className="space-y-2">
          {snapshots.map((snap) => {
            const cfg = STATUS_CONFIG[snap.status];
            const Icon = cfg.icon;
            return (
              <div key={snap.id} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2">
                <Icon className={`h-4 w-4 shrink-0 ${cfg.color} ${snap.status === "running" ? "animate-spin" : ""}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{snap.id}</span>
                    <span className={`rounded-full border px-1.5 text-[10px] uppercase ${TYPE_BADGE[snap.type]}`}>{snap.type}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {snap.recordCount.toLocaleString()} records · {snap.sizeGb.toFixed(2)} GB · {formatRelative(snap.startedAt)}
                  </p>
                </div>
                <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recovery Points</p>
        <div className="space-y-1">
          {recoveryPoints.slice(0, 3).map((rp) => (
            <div key={rp.snapshotId} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2">
              <div>
                <span className="text-xs text-white font-medium">{rp.snapshotId}</span>
                <p className="text-[10px] text-slate-500">{rp.collectionsIncluded.length} collections · ~{rp.estimatedRecoveryMinutes}min</p>
              </div>
              <span className={`text-xs ${rp.verified ? "text-green-400" : "text-yellow-400"}`}>
                {rp.verified ? "Verified" : "Unverified"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
