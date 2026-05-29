import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { getGovernanceLogs } from "@/lib/governance14/governance-engine";

const CAT_STYLE: Record<string, string> = {
  policy: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  access: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  data: "text-green-400 bg-green-500/10 border-green-500/20",
  compliance: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  deployment: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  audit: "text-slate-400 bg-slate-700/30 border-slate-600",
};

const OUTCOME_ICON: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2, failure: XCircle, pending: Clock,
};
const OUTCOME_COLOR: Record<string, string> = {
  success: "text-green-400", failure: "text-red-400", pending: "text-yellow-400",
};

export function GovernanceLog() {
  const logs = getGovernanceLogs(12);
  return (
    <div className="space-y-1.5">
      {logs.map((l) => {
        const CatCls = CAT_STYLE[l.category] ?? CAT_STYLE.audit;
        const Icon = OUTCOME_ICON[l.outcome] ?? Clock;
        const outcomeColor = OUTCOME_COLOR[l.outcome] ?? OUTCOME_COLOR.pending;
        return (
          <div key={l.id} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
            <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${outcomeColor}`} />
            <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase flex-shrink-0 ${CatCls}`}>{l.category}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{l.action.replace(/_/g, " ")}</p>
              <p className="text-[9px] text-slate-500">{l.actor} · {l.entityType} {l.entityId}</p>
            </div>
            <span className="text-[9px] text-slate-600 flex-shrink-0">{new Date(l.timestamp).toLocaleDateString("en-IN")}</span>
          </div>
        );
      })}
    </div>
  );
}
