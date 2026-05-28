import { Upload, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { getFieldVerificationMissions } from "@/lib/validation/ground-truth";

export function GroundTruthUpload() {
  const missions = getFieldVerificationMissions();

  const STATUS_STYLE: Record<string, string> = {
    completed: "text-green-400 bg-green-500/10 border-green-500/20",
    active: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    planned: "text-slate-400 bg-slate-700/30 border-slate-600",
    cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const STATUS_ICON: Record<string, typeof CheckCircle2> = {
    completed: CheckCircle2,
    active: Clock,
    planned: AlertTriangle,
    cancelled: AlertTriangle,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-600 bg-slate-800/40 px-4 py-4 cursor-pointer hover:border-green-500/40 transition-colors">
        <Upload className="h-5 w-5 text-slate-500" />
        <div>
          <p className="text-sm font-medium text-slate-300">Upload Ground-Truth Observations</p>
          <p className="text-xs text-slate-500">CSV or GeoJSON · Supports batch upload for multiple farms</p>
        </div>
      </div>
      <div className="space-y-2">
        {missions.map((mission) => {
          const StyleCls = STATUS_STYLE[mission.status] ?? STATUS_STYLE.planned;
          const Icon = STATUS_ICON[mission.status] ?? Clock;
          const progress = mission.targetFarms > 0 ? (mission.completedFarms / mission.targetFarms) * 100 : 0;
          return (
            <div key={mission.id} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">{mission.missionName}</p>
                  <p className="text-xs text-slate-500">{mission.district}, {mission.state} · {mission.leadAuditor}</p>
                </div>
                <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${StyleCls}`}>
                  <Icon className="h-2.5 w-2.5" />
                  {mission.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-slate-700">
                  <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${Math.min(100, progress).toFixed(0)}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 w-16 text-right">{mission.completedFarms}/{mission.targetFarms} farms</span>
              </div>
              <div className="flex gap-3 text-[10px] text-slate-500">
                <span>{mission.groundTruthCount} observations</span>
                <span>{mission.anomaliesFound} anomalies found</span>
                <span>{mission.startDate} → {mission.endDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
