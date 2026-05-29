import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { getVerificationRecords } from "@/lib/trust/verification-registry";

const STATUS_STYLE: Record<string, string> = {
  verified: "text-green-400 bg-green-500/10 border-green-500/20",
  in_review: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  pending: "text-slate-400 bg-slate-700/30 border-slate-600",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  revoked: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};
const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  verified: CheckCircle2, in_review: Clock, pending: Clock, rejected: XCircle, revoked: AlertTriangle,
};

export function VerificationRegistry() {
  const records = getVerificationRecords(10);
  return (
    <div className="space-y-2">
      {records.map((r) => {
        const StyleCls = STATUS_STYLE[r.status] ?? STATUS_STYLE.pending;
        const Icon = STATUS_ICON[r.status] ?? Clock;
        return (
          <div key={r.id} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p className="text-sm font-semibold text-white">{r.farmName}</p>
                <p className="text-[10px] text-slate-500">{r.id} · {r.auditOrg} · {r.standard}</p>
              </div>
              <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${StyleCls}`}>
                <Icon className="h-2.5 w-2.5" />{r.status.replace("_", " ")}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px]">
              <div><p className="text-white font-medium">{r.carbonClaimedTonnes} t</p><p className="text-slate-500">Claimed</p></div>
              <div><p className="text-white font-medium">{r.carbonVerifiedTonnes ? `${r.carbonVerifiedTonnes} t` : "—"}</p><p className="text-slate-500">Verified</p></div>
              <div><p className="text-white font-medium">{r.confidenceLevel}%</p><p className="text-slate-500">Confidence</p></div>
              <div><p className="text-white font-medium truncate">{r.certificateId ?? "Pending"}</p><p className="text-slate-500">Certificate</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
