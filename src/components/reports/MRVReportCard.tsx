import { FileText, CheckCircle2, Clock, AlertTriangle, Download } from "lucide-react";
import type { MonitoringReport, ReportFormat } from "@/types";
import { AuditStatusBadge } from "@/components/audit/AuditStatusBadge";

const FORMAT_LABELS: Record<ReportFormat, string> = {
  mrv: "MRV Report",
  carbon_summary: "Carbon Summary",
  audit_export: "Audit Export",
  executive: "Executive Report",
};

const FORMAT_COLORS: Record<ReportFormat, string> = {
  mrv: "text-green-400",
  carbon_summary: "text-emerald-400",
  audit_export: "text-blue-400",
  executive: "text-purple-400",
};

interface MRVReportCardProps {
  report: MonitoringReport;
  onDownload?: (report: MonitoringReport) => void;
}

export function MRVReportCard({ report, onDownload }: MRVReportCardProps) {
  const statusIcon =
    report.status === "ready" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> :
    report.status === "generating" ? <Clock className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> :
    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;

  return (
    <div className="p-4 rounded-2xl border border-border bg-card hover:border-green-500/20 transition-all group">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-500/8 border border-green-500/15 flex items-center justify-center shrink-0">
          <FileText className={`w-4 h-4 ${FORMAT_COLORS[report.format]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground truncate">{report.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-medium ${FORMAT_COLORS[report.format]}`}>
                  {FORMAT_LABELS[report.format]}
                </span>
                <span className="text-muted-foreground/30">·</span>
                {statusIcon}
                <span className="text-xs text-muted-foreground/60 capitalize">{report.status}</span>
              </div>
            </div>
            {report.status === "ready" && onDownload && (
              <button
                onClick={() => onDownload(report)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-green-400/70 hover:text-green-400 shrink-0"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {report.ndviAverage !== undefined && (
          <div className="p-2 rounded-xl bg-muted border border-border text-center">
            <p className="text-xs font-bold font-mono text-green-400">{report.ndviAverage.toFixed(3)}</p>
            <p className="text-[9px] text-muted-foreground/50">NDVI</p>
          </div>
        )}
        {report.carbonScoreTonnes !== undefined && (
          <div className="p-2 rounded-xl bg-muted border border-border text-center">
            <p className="text-xs font-bold font-mono text-emerald-400">{report.carbonScoreTonnes.toFixed(1)}t</p>
            <p className="text-[9px] text-muted-foreground/50">CO₂e</p>
          </div>
        )}
        {report.confidenceScore !== undefined && (
          <div className="p-2 rounded-xl bg-muted border border-border text-center">
            <p className={`text-xs font-bold font-mono ${report.confidenceScore >= 70 ? "text-green-400" : report.confidenceScore >= 40 ? "text-yellow-400" : "text-orange-400"}`}>
              {report.confidenceScore}/100
            </p>
            <p className="text-[9px] text-muted-foreground/50">Confidence</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {report.auditStatus && <AuditStatusBadge status={report.auditStatus} size="sm" />}
          {report.evidenceCount !== undefined && (
            <span className="text-[10px] text-muted-foreground/40">{report.evidenceCount} evidence items</span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground/40">
          {report.periodStart} → {report.periodEnd}
        </span>
      </div>
    </div>
  );
}
