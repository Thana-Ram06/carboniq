import { User, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { getAuditorAssignments } from "@/lib/field/field-operations";

const STATUS_CONFIG = {
  active:     { icon: CheckCircle, color: "text-green-400",  label: "Active" },
  on_leave:   { icon: Clock,       color: "text-yellow-400", label: "On Leave" },
  overloaded: { icon: AlertCircle, color: "text-red-400",    label: "Overloaded" },
};

export function AuditorAssignmentBoard() {
  const auditors = getAuditorAssignments();

  return (
    <div className="space-y-2">
      {auditors.map((a) => {
        const cfg = STATUS_CONFIG[a.status];
        const StatusIcon = cfg.icon;
        const completionRate = a.assignedFarms > 0
          ? Math.round((a.completedAudits / a.assignedFarms) * 100)
          : 0;

        return (
          <div key={a.id} className={`rounded-xl border p-3 ${a.status === "overloaded" ? "border-red-500/20 bg-red-500/5" : "border-slate-700 bg-slate-700/20"}`}>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{a.auditorName}</span>
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{a.region}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${completionRate >= 80 ? "bg-green-500" : completionRate >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 w-12 text-right">{a.completedAudits}/{a.assignedFarms}</span>
                </div>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                  <span>{a.pendingAudits} pending</span>
                  <span>avg {a.avgCompletionDays}d</span>
                  <span>due {a.nextDeadline}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
