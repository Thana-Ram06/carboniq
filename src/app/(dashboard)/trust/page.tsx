import { ShieldCheck, GitBranch, Award } from "lucide-react";
import { getVerificationSummary, getConfidenceCertifications } from "@/lib/trust/verification-registry";
import { VerificationRegistry } from "@/components/trust/VerificationRegistry";
import { AuditLineage } from "@/components/trust/AuditLineage";

const TIER_STYLE: Record<string, string> = {
  platinum: "text-blue-300 bg-blue-500/10 border-blue-500/30",
  gold: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  silver: "text-slate-300 bg-slate-700/30 border-slate-500",
  bronze: "text-orange-400 bg-orange-500/10 border-orange-500/30",
};

export default function TrustPage() {
  const summary = getVerificationSummary();
  const certs = getConfidenceCertifications();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Trust & Verification Registry</h1>
        <p className="text-slate-400 mt-1 text-sm">Immutable audit lineage, verification records, confidence certifications, and public trust indicators</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.verified}</p>
          <p className="text-xs text-slate-400">Verified Records</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.inReview}</p>
          <p className="text-xs text-slate-400">In Review</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.avgConfidence}%</p>
          <p className="text-xs text-slate-400">Avg Confidence</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalCarbonVerified.toLocaleString()} t</p>
          <p className="text-xs text-slate-400">Carbon Verified</p>
        </div>
      </div>

      {/* Verification records */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Verification Registry</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.total} records</span>
        </div>
        <VerificationRegistry />
      </div>

      {/* Audit lineage */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Audit Lineage</h2>
          <span className="ml-auto text-xs text-slate-500">Immutable event chain</span>
        </div>
        <AuditLineage />
      </div>

      {/* Confidence certifications */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Confidence Certifications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {certs.map((c) => (
            <div key={c.certId} className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold text-white">{c.farmName}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TIER_STYLE[c.tier] ?? TIER_STYLE.silver}`}>{c.tier}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] mb-1.5">
                <div><p className="text-white font-medium">{c.ndviConfidence}%</p><p className="text-slate-500">NDVI</p></div>
                <div><p className="text-white font-medium">{c.carbonConfidence}%</p><p className="text-slate-500">Carbon</p></div>
                <div><p className="text-white font-medium">{c.overallConfidence}%</p><p className="text-slate-500">Overall</p></div>
              </div>
              <p className="text-[9px] text-slate-500">{c.certId} · Issued {new Date(c.issuedAt).toLocaleDateString("en-IN")} · {c.issuer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
