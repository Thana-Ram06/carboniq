import { Shield, ShieldCheck, ShieldAlert, Lock } from "lucide-react";
import { getAccessEventSummary } from "@/lib/security/audit-trail";
import { AuditTrailView } from "@/components/security/AuditTrailView";
import { RateLimitMonitor } from "@/components/security/RateLimitMonitor";

export default function SecurityPage() {
  const summary = getAccessEventSummary();

  const complianceItems = [
    { label: "ISO 27001",       status: "compliant",    note: "Audit trail, access control, incident management" },
    { label: "SOC 2 Type II",   status: "partial",      note: "Controls present; formal certification pending" },
    { label: "ISO 14064-3",     status: "compliant",    note: "Carbon MRV methodology documented and traceable" },
    { label: "UNFCCC Registry", status: "compliant",    note: "Report format aligned with CDM standards" },
    { label: "GDPR / DPDPA",    status: "partial",      note: "Data minimization applied; DPO not yet appointed" },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Security & Compliance</h1>
        <p className="text-slate-400 mt-1 text-sm">Audit trail, access events, abuse protection, and compliance posture</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalEvents}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Events</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-red-400">{summary.criticalEvents}</p>
          <p className="text-xs text-slate-400 mt-0.5">Critical Events</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-yellow-400">{summary.failedLogins}</p>
          <p className="text-xs text-slate-400 mt-0.5">Failed Logins</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.adminActions}</p>
          <p className="text-xs text-slate-400 mt-0.5">Admin Actions</p>
        </div>
      </div>

      {/* Audit trail + rate limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Audit Trail</h2>
            <span className="ml-auto text-xs text-slate-500">ISO 27001 · SOC 2</span>
          </div>
          <AuditTrailView />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-semibold text-white">Abuse & Rate Limiting</h2>
          </div>
          <RateLimitMonitor />
        </div>
      </div>

      {/* Compliance posture */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Compliance Posture</h2>
        </div>
        <div className="space-y-2">
          {complianceItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
              <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${item.status === "compliant" ? "bg-green-400" : "bg-yellow-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                  <span className={`rounded-full border px-2 text-[10px] uppercase font-medium ${item.status === "compliant" ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security features */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-purple-400" />
          <h2 className="text-base font-semibold text-white">Security Hardening</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Firebase Auth",     status: true,  note: "Multi-provider, email/Google" },
            { label: "HTTPS Only",        status: true,  note: "Enforced via Vercel" },
            { label: "RBAC",              status: true,  note: "farmer/auditor/org_manager/admin" },
            { label: "API Rate Limiting", status: true,  note: "Per-IP, per-key limits active" },
            { label: "CSP Headers",       status: false, note: "Not yet configured" },
            { label: "Sentry Error Track",status: false, note: "DSN not configured" },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl border px-3 py-2.5 ${item.status ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}`}>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${item.status ? "bg-green-400" : "bg-yellow-400"}`} />
                <span className="text-xs font-semibold text-white">{item.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
