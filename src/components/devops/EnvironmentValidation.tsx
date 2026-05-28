"use client";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { EnvironmentCheck } from "@/types";
import { validateEnvironment } from "@/lib/devops/deployment-tracker";

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/5",   border: "border-green-500/20" },
  warn: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/20" },
  fail: { icon: XCircle,       color: "text-red-400",   bg: "bg-red-500/5",    border: "border-red-500/20" },
};

function CheckRow({ check }: { check: EnvironmentCheck }) {
  const cfg = STATUS_CONFIG[check.status];
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${cfg.bg} ${cfg.border}`}>
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white">{check.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{check.message}</p>
      </div>
    </div>
  );
}

export function EnvironmentValidation() {
  const validation = validateEnvironment("production");
  const passCount = validation.checks.filter((c) => c.status === "pass").length;
  const warnCount = validation.checks.filter((c) => c.status === "warn").length;
  const failCount = validation.checks.filter((c) => c.status === "fail").length;

  const overallColors = {
    healthy: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    degraded: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    failed: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  }[validation.overallStatus];

  return (
    <div className="space-y-3">
      <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${overallColors.bg} ${overallColors.border}`}>
        <div>
          <p className="text-sm font-bold text-white capitalize">{validation.overallStatus}</p>
          <p className="text-xs text-slate-400">{validation.env} environment</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-green-400 font-semibold">{passCount} pass</span>
          {warnCount > 0 && <span className="text-yellow-400 font-semibold">{warnCount} warn</span>}
          {failCount > 0 && <span className="text-red-400 font-semibold">{failCount} fail</span>}
        </div>
      </div>

      <div className="space-y-2">
        {validation.checks.map((check) => (
          <CheckRow key={check.name} check={check} />
        ))}
      </div>
    </div>
  );
}
