import { FileText, Download, CheckCircle, Clock, Edit3 } from "lucide-react";
import type { ComplianceReport } from "@/types";
import { getComplianceReports, getComplianceSummary } from "@/lib/compliance/compliance-reporter";

const STATUS_CONFIG: Record<ComplianceReport["verificationStatus"], { icon: React.ElementType; color: string; label: string }> = {
  approved:       { icon: CheckCircle, color: "text-green-400",  label: "Approved" },
  submitted:      { icon: CheckCircle, color: "text-blue-400",   label: "Submitted" },
  pending_review: { icon: Clock,       color: "text-yellow-400", label: "Pending" },
  draft:          { icon: Edit3,       color: "text-slate-400",  label: "Draft" },
};

const STANDARD_COLORS: Record<string, string> = {
  ISO14064:    "text-blue-400 border-blue-500/30 bg-blue-500/10",
  UNFCCC:      "text-green-400 border-green-500/30 bg-green-500/10",
  GoldStandard:"text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  VCS:         "text-purple-400 border-purple-500/30 bg-purple-500/10",
  IPCC:        "text-teal-400 border-teal-500/30 bg-teal-500/10",
};

export function ComplianceExportPanel() {
  const reports = getComplianceReports();
  const summary = getComplianceSummary();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-green-400">{summary.approvalRate}%</p>
          <p className="text-xs text-slate-400">Approval Rate</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{summary.totalReports}</p>
          <p className="text-xs text-slate-400">Total Reports</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-blue-400">{summary.standardsCovered}</p>
          <p className="text-xs text-slate-400">Standards</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{(summary.totalCarbonTonnes / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400">tCO₂e Total</p>
        </div>
      </div>

      <div className="space-y-2">
        {reports.map((r) => {
          const cfg = STATUS_CONFIG[r.verificationStatus];
          const Icon = cfg.icon;
          const stdColor = STANDARD_COLORS[r.standard] ?? "text-slate-400 border-slate-600 bg-slate-700/20";
          return (
            <div key={r.id} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-700/20 p-3">
              <FileText className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-xs font-semibold text-white truncate">{r.title}</p>
                  <span className={`rounded-full border px-1.5 text-[9px] uppercase font-medium ${stdColor}`}>{r.standard}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-slate-500">
                  <span>{r.period}</span>
                  <span>{r.farmsIncluded.toLocaleString()} farms</span>
                  <span>{(r.totalCarbonTonnes).toLocaleString()} tCO₂e</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                <Download className="h-3.5 w-3.5 text-slate-500 ml-1 cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
