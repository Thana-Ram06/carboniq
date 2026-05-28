"use client";
import { CheckCircle2, XCircle, Clock, GitCommit } from "lucide-react";
import type { DeploymentStatus } from "@/types";
import { getDeploymentHistory } from "@/lib/devops/deployment-tracker";

const STATUS_CONFIG: Record<DeploymentStatus, { icon: React.ElementType; color: string; label: string }> = {
  deployed:    { icon: CheckCircle2, color: "text-green-400",  label: "Deployed" },
  failed:      { icon: XCircle,      color: "text-red-400",    label: "Failed" },
  building:    { icon: Clock,        color: "text-blue-400",   label: "Building" },
  pending:     { icon: Clock,        color: "text-slate-400",  label: "Pending" },
  rolled_back: { icon: XCircle,      color: "text-orange-400", label: "Rolled Back" },
};

function formatDuration(ms?: number): string {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function DeploymentTracker() {
  const deployments = getDeploymentHistory();

  return (
    <div className="space-y-2">
      {deployments.map((dep, i) => {
        const cfg = STATUS_CONFIG[dep.status];
        const Icon = cfg.icon;
        return (
          <div
            key={dep.id}
            className={`rounded-xl border p-4 ${i === 0 ? "border-green-500/30 bg-green-500/5" : "border-slate-700 bg-slate-700/20"}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-white truncate">{dep.commitMessage}</span>
                  {i === 0 && (
                    <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2 text-[10px] text-green-400 uppercase font-medium">latest</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <GitCommit className="h-3 w-3" />
                    {dep.commit}
                  </span>
                  <span>{dep.pageCount} pages</span>
                  <span>{formatDuration(dep.durationMs)}</span>
                  <span>{formatRelative(dep.startedAt)}</span>
                  <span className={cfg.color}>{cfg.label}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
