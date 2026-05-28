import { MapPin, CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { getPilotRollouts } from "@/lib/deployment/template-engine";

const STATUS_CONFIG = {
  planning:  { color: "text-slate-400",  bg: "bg-slate-700/20",  border: "border-slate-700",     label: "Planning" },
  active:    { color: "text-blue-400",   bg: "bg-blue-500/5",    border: "border-blue-500/20",   label: "Active" },
  completed: { color: "text-green-400",  bg: "bg-green-500/5",   border: "border-green-500/20",  label: "Completed" },
  paused:    { color: "text-yellow-400", bg: "bg-yellow-500/5",  border: "border-yellow-500/20", label: "Paused" },
};

export function PilotRolloutTracker() {
  const pilots = getPilotRollouts();

  return (
    <div className="space-y-3">
      {pilots.map((pilot) => {
        const cfg = STATUS_CONFIG[pilot.status];
        return (
          <div key={pilot.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">{pilot.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />{pilot.region}
                </p>
              </div>
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>

            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">{pilot.partnerOrg}</span>
              <span className={`font-bold ${cfg.color}`}>{pilot.progressPct}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${pilot.status === "completed" ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${pilot.progressPct}%` }}
              />
            </div>

            <div className="flex gap-4 text-[10px] text-slate-500 mb-2">
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{pilot.activeFarms}/{pilot.targetFarms} farms</span>
              <span>{pilot.startDate} → {pilot.targetDate}</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {pilot.milestones.map((m) => (
                <div key={m.label} className="flex items-center gap-1">
                  {m.achieved
                    ? <CheckCircle2 className="h-3 w-3 text-green-400" />
                    : <Circle className="h-3 w-3 text-slate-600" />
                  }
                  <span className={`text-[10px] ${m.achieved ? "text-green-400" : "text-slate-600"}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
