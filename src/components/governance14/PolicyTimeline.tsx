import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { getComplianceTimeline } from "@/lib/governance14/governance-engine";

const STATUS_STYLE: Record<string, string> = {
  completed: "text-green-400 bg-green-500/10 border-green-500/20",
  upcoming: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  overdue: "text-red-400 bg-red-500/10 border-red-500/20",
};
const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2, upcoming: Clock, overdue: AlertTriangle,
};

export function PolicyTimeline() {
  const timeline = getComplianceTimeline();
  return (
    <div className="relative">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-700" />
      <div className="space-y-3">
        {timeline.map((item, i) => {
          const StyleCls = STATUS_STYLE[item.status] ?? STATUS_STYLE.upcoming;
          const Icon = STATUS_ICON[item.status] ?? Clock;
          return (
            <div key={i} className="flex items-start gap-3 pl-10 relative">
              <div className={`absolute left-3 top-1 w-3 h-3 rounded-full border flex items-center justify-center ${StyleCls} -translate-x-1/2`}>
                <Icon className="h-1.5 w-1.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-white">{item.event}</p>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${StyleCls}`}>{item.status}</span>
                </div>
                <div className="flex gap-2 text-[10px] text-slate-500">
                  <span>{item.date}</span>
                  <span>·</span>
                  <span>{item.standard}</span>
                  <span>·</span>
                  <span>{item.responsible}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
