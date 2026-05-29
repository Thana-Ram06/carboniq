import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { getCalibrationApprovals } from "@/lib/oversight/scientific-oversight";

const STATUS_STYLE: Record<string, string> = {
  approved: "text-green-400 bg-green-500/10 border-green-500/20",
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
};
const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  approved: CheckCircle2, pending: Clock, rejected: XCircle,
};

export function CalibrationApprovals() {
  const approvals = getCalibrationApprovals();
  return (
    <div className="space-y-2">
      {approvals.map((a) => {
        const StyleCls = STATUS_STYLE[a.status] ?? STATUS_STYLE.pending;
        const Icon = STATUS_ICON[a.status] ?? Clock;
        const delta = a.proposedValue - a.currentValue;
        return (
          <div key={a.id} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <div className="flex items-start justify-between mb-1">
              <span className="text-xs font-mono text-blue-300">{a.paramName}</span>
              <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${StyleCls}`}>
                <Icon className="h-2.5 w-2.5" />{a.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-1.5">{a.justification}</p>
            <div className="flex gap-4 text-[10px]">
              <span className="text-slate-500">Current: <span className="font-mono text-white">{a.currentValue}</span></span>
              <span className="text-slate-500">Proposed: <span className="font-mono text-white">{a.proposedValue}</span></span>
              <span className={delta >= 0 ? "text-green-400" : "text-red-400"}>Δ {delta >= 0 ? "+" : ""}{delta.toFixed(5)}</span>
              {a.reviewedBy && <span className="text-slate-500">by {a.reviewedBy}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
