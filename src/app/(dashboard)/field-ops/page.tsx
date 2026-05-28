import { Clipboard, Users, MapPin, AlertCircle } from "lucide-react";
import { getAuditorAssignments } from "@/lib/field/field-operations";
import { SOPDashboard } from "@/components/field/SOPDashboard";
import { AuditorAssignmentBoard } from "@/components/field/AuditorAssignmentBoard";

export default function FieldOpsPage() {
  const auditors = getAuditorAssignments();
  const active = auditors.filter((a) => a.status === "active").length;
  const overloaded = auditors.filter((a) => a.status === "overloaded").length;
  const totalPending = auditors.reduce((s, a) => s + a.pendingAudits, 0);
  const totalCompleted = auditors.reduce((s, a) => s + a.completedAudits, 0);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Field Operations Toolkit</h1>
        <p className="text-slate-400 mt-1 text-sm">Auditor assignments, field SOPs, evidence collection workflows, and regional coordination</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{active}</p>
          <p className="text-xs text-slate-400">Active Auditors</p>
        </div>
        <div className={`rounded-xl border px-4 py-3 ${overloaded > 0 ? "border-red-500/20 bg-red-500/10" : "border-slate-700 bg-slate-700/20"}`}>
          <p className={`text-2xl font-bold ${overloaded > 0 ? "text-red-400" : "text-white"}`}>{overloaded}</p>
          <p className="text-xs text-slate-400">Overloaded</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-yellow-400">{totalPending}</p>
          <p className="text-xs text-slate-400">Pending Audits</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{totalCompleted}</p>
          <p className="text-xs text-slate-400">Completed</p>
        </div>
      </div>

      {overloaded > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{overloaded} auditor{overloaded > 1 ? "s" : ""} overloaded — consider redistributing farm assignments</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auditor board */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Auditor Assignments</h2>
          </div>
          <AuditorAssignmentBoard />
        </div>

        {/* SOP library */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clipboard className="h-5 w-5 text-green-400" />
            <h2 className="text-base font-semibold text-white">Field SOPs</h2>
          </div>
          <SOPDashboard />
        </div>
      </div>

      {/* Regional coordination */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-orange-400" />
          <h2 className="text-base font-semibold text-white">Regional Coverage</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {auditors.map((a) => {
            const rate = a.assignedFarms > 0 ? Math.round((a.completedAudits / a.assignedFarms) * 100) : 0;
            return (
              <div key={a.id} className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3">
                <p className="text-xs font-semibold text-white truncate">{a.region}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{a.auditorName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${rate}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{rate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
