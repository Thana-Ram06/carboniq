"use client";

import { useState } from "react";
import { Download, FileText, FileJson, Loader2, CheckCircle2 } from "lucide-react";
import type { Farm } from "@/types";
import { buildDistrictExport, exportToCSV, downloadCSV, downloadJSON } from "@/lib/export/export-engine";

interface ExportPanelProps {
  farms: Farm[];
}

type ExportFormat = "csv" | "json";

export function ExportPanel({ farms }: ExportPanelProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [done, setDone] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setExporting(format);
    setDone(null);
    await new Promise((r) => setTimeout(r, 600));
    const bundle = buildDistrictExport(farms);
    const timestamp = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      downloadCSV(exportToCSV(bundle), `vasudha_export_${timestamp}.csv`);
    } else {
      downloadJSON(bundle, `vasudha_export_${timestamp}.json`);
    }
    setExporting(null);
    setDone(format);
    setTimeout(() => setDone(null), 3000);
  }

  const buttons: Array<{ fmt: ExportFormat; label: string; icon: typeof Download; desc: string }> = [
    { fmt: "csv",  label: "Export CSV",  icon: FileText, desc: "Spreadsheet-ready farm data" },
    { fmt: "json", label: "Export JSON", icon: FileJson, desc: "Machine-readable full bundle" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-foreground">Enterprise Export</h3>
        <span className="text-[10px] text-muted-foreground/40 ml-auto">{farms.length} farms</span>
      </div>

      <p className="text-xs text-muted-foreground/60 mb-4">
        Generate district-level reports with NDVI, carbon estimates, and quality grades for all farms.
      </p>

      <div className="space-y-2">
        {buttons.map(({ fmt, label, icon: Icon, desc }) => {
          const isExporting = exporting === fmt;
          const isDone = done === fmt;
          return (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={!!exporting || farms.length === 0}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-border bg-muted/30 hover:border-green-500/20 hover:bg-muted/50 transition-all disabled:opacity-50 text-left"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
              ) : isDone ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Icon className="w-4 h-4 text-muted-foreground/40" />
              )}
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground/50">{desc}</p>
              </div>
              <Download className="w-3 h-3 text-muted-foreground/30" />
            </button>
          );
        })}
      </div>

      {farms.length === 0 && (
        <p className="text-[11px] text-muted-foreground/40 text-center mt-3">
          Add farms to enable export
        </p>
      )}
    </div>
  );
}
