import { FlaskConical, Settings2, BookOpen } from "lucide-react";
import { getOversightSummary, getMethodologyRevisions } from "@/lib/oversight/scientific-oversight";
import { PeerReviewWorkflow } from "@/components/oversight/PeerReviewWorkflow";
import { CalibrationApprovals } from "@/components/oversight/CalibrationApprovals";

export default function OversightPage() {
  const summary = getOversightSummary();
  const revisions = getMethodologyRevisions();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Scientific Oversight</h1>
        <p className="text-slate-400 mt-1 text-sm">Peer review workflows, calibration approval chains, methodology revision tracking, and validation committee records</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.approvedReviews}</p>
          <p className="text-xs text-slate-400">Approved Reviews</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.pendingReviews}</p>
          <p className="text-xs text-slate-400">Pending Reviews</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-yellow-400">{summary.pendingCalibrations}</p>
          <p className="text-xs text-slate-400">Pending Calibrations</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.methodologyRevisions}</p>
          <p className="text-xs text-slate-400">Method Revisions</p>
        </div>
      </div>

      {/* Peer review */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="h-5 w-5 text-purple-400" />
          <h2 className="text-base font-semibold text-white">Peer Review Queue</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.totalReviews} total</span>
        </div>
        <PeerReviewWorkflow />
      </div>

      {/* Calibration approvals */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Calibration Approval Chain</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.pendingCalibrations} pending</span>
        </div>
        <CalibrationApprovals />
      </div>

      {/* Methodology revisions */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Methodology Revisions</h2>
        </div>
        <div className="space-y-3">
          {revisions.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <p className="text-xs font-semibold text-blue-300">{r.section}</p>
                  <p className="text-[10px] text-slate-500">{r.version} · Effective {r.effectiveDate} · Approved by {r.approvedBy}</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-1">{r.revision}</p>
              <p className="text-[10px] text-slate-500 italic mb-1.5">Reason: {r.reason}</p>
              {r.impactedModels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.impactedModels.map((m) => (
                    <span key={m} className="rounded border border-slate-600 bg-slate-700/30 px-1.5 py-0.5 text-[9px] text-slate-400">{m}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
