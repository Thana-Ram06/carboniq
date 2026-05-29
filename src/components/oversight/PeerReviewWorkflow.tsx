import { CheckCircle2, Clock, AlertTriangle, XCircle, RotateCcw } from "lucide-react";
import { getPeerReviewRecords } from "@/lib/oversight/scientific-oversight";

const STATUS_STYLE: Record<string, string> = {
  approved: "text-green-400 bg-green-500/10 border-green-500/20",
  under_review: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  submitted: "text-slate-400 bg-slate-700/30 border-slate-600",
  revision_requested: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  approved: CheckCircle2, under_review: Clock, submitted: Clock, revision_requested: RotateCcw, rejected: XCircle,
};

const TYPE_BADGE: Record<string, string> = {
  methodology: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  calibration: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  validation: "text-green-400 bg-green-500/10 border-green-500/20",
  report: "text-slate-400 bg-slate-700/30 border-slate-600",
};

export function PeerReviewWorkflow() {
  const reviews = getPeerReviewRecords();
  return (
    <div className="space-y-2">
      {reviews.map((r) => {
        const StyleCls = STATUS_STYLE[r.status] ?? STATUS_STYLE.submitted;
        const Icon = STATUS_ICON[r.status] ?? Clock;
        return (
          <div key={r.id} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-semibold text-white leading-tight">{r.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">By {r.submittedBy} · Round {r.revisionRound}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase ${TYPE_BADGE[r.reviewType] ?? TYPE_BADGE.report}`}>{r.reviewType}</span>
                <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${StyleCls}`}>
                  <Icon className="h-2.5 w-2.5" />{r.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mb-1.5">{r.summary}</p>
            <div className="flex gap-2 text-[9px] text-slate-500">
              <span>Reviewers: {r.reviewedBy.join(", ")}</span>
              <span>·</span>
              <span>Deadline {new Date(r.deadline).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
