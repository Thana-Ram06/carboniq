"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MRVReportData } from "@/lib/reporting/mrv-report";
import toast from "react-hot-toast";

interface PDFExporterProps {
  reportData: MRVReportData;
  fileName?: string;
}

export function PDFExporter({ reportData, fileName }: PDFExporterProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = margin;

      // Helper functions
      const addText = (text: string, x: number, yPos: number, opts?: { fontSize?: number; color?: string; bold?: boolean; align?: "left" | "center" | "right" }) => {
        doc.setFontSize(opts?.fontSize ?? 10);
        doc.setTextColor(opts?.color ?? "#e5e7eb");
        if (opts?.bold) doc.setFont("helvetica", "bold");
        else doc.setFont("helvetica", "normal");
        doc.text(text, x, yPos, { align: opts?.align ?? "left" });
      };

      const section = (title: string, yPos: number): number => {
        doc.setFillColor(20, 28, 20);
        doc.rect(margin, yPos, contentW, 7, "F");
        addText(title, margin + 3, yPos + 5, { fontSize: 9, bold: true, color: "#4ade80" });
        return yPos + 12;
      };

      const metric = (label: string, value: string, x: number, yPos: number) => {
        addText(label, x, yPos, { fontSize: 8, color: "#6b7280" });
        addText(value, x, yPos + 5, { fontSize: 11, bold: true, color: "#f0fdf4" });
        return yPos + 12;
      };

      // ── Page background ───────────────────────────────────────────────────
      doc.setFillColor(9, 14, 9);
      doc.rect(0, 0, pageW, pageH, "F");

      // ── Cover header ──────────────────────────────────────────────────────
      doc.setFillColor(16, 185, 129, 0.12);
      doc.rect(0, 0, pageW, 48, "F");

      addText("VASUDHA", margin, y + 8, { fontSize: 20, bold: true, color: "#4ade80" });
      addText("MRV VERIFICATION REPORT", margin, y + 15, { fontSize: 9, color: "#6b7280" });
      addText(`${reportData.period.start}  →  ${reportData.period.end}`, pageW - margin, y + 8, { fontSize: 9, color: "#6b7280", align: "right" });
      addText(`Generated: ${new Date(reportData.generatedAt).toLocaleDateString("en-IN", { dateStyle: "long" })}`, pageW - margin, y + 14, { fontSize: 8, color: "#4b5563", align: "right" });

      y = 52;

      // Farm details
      addText(reportData.farm.name, margin, y, { fontSize: 15, bold: true, color: "#f0fdf4" });
      addText(`${reportData.farm.location}, ${reportData.farm.district}, ${reportData.farm.state}  ·  ${reportData.farm.areaHectares.toFixed(2)} ha  ·  ${reportData.farm.cropType}`, margin, y + 7, { fontSize: 9, color: "#6b7280" });
      y += 20;

      // ── Executive summary ─────────────────────────────────────────────────
      y = section("EXECUTIVE SUMMARY", y);

      const metrics: [string, string, number, number][] = [
        ["NDVI Index", reportData.ndvi.toFixed(3), margin, y],
        ["Health Grade", reportData.healthScore.label, margin + contentW / 4, y],
        ["CO₂e (tonnes)", reportData.carbon.carbonScoreTonnes.toFixed(2), margin + contentW / 2, y],
        ["Confidence", `${reportData.confidence.overall}/100`, margin + (3 * contentW) / 4, y],
      ];
      metrics.forEach(([l, v, x, yy]) => metric(l, v, x, yy));
      y += 18;

      const metrics2: [string, string, number, number][] = [
        ["Biomass (t)", reportData.carbon.biomassGreenTonnes.toFixed(2), margin, y],
        ["Carbon Credits", `$${reportData.carbon.carbonCreditEstimate.toLocaleString()}`, margin + contentW / 4, y],
        ["Sustainability", `${reportData.carbon.sustainabilityIndex}/100`, margin + contentW / 2, y],
        ["Risk Level", reportData.risk.severity.toUpperCase(), margin + (3 * contentW) / 4, y],
      ];
      metrics2.forEach(([l, v, x, yy]) => metric(l, v, x, yy));
      y += 16;

      // ── Confidence breakdown ──────────────────────────────────────────────
      y = section("MRV CONFIDENCE SCORE", y);
      addText(`${reportData.confidence.label} (${reportData.confidence.overall}/100)`, margin, y, { fontSize: 11, bold: true, color: "#4ade80" });
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [["Component", "Score", "Max", "Weight"]],
        body: [
          ["NDVI Data Quality", reportData.confidence.ndviScore, 40, "40%"],
          ["Field Evidence", reportData.confidence.evidenceScore, 30, "30%"],
          ["Audit Review", reportData.confidence.auditScore, 25, "25%"],
          ["Vegetation Consistency", reportData.confidence.consistencyScore, 15, "15%"],
        ],
        theme: "plain",
        styles: { textColor: [229, 231, 235], fontSize: 9, fillColor: [9, 14, 9] },
        headStyles: { fillColor: [20, 28, 20], textColor: [74, 222, 128], fontSize: 8, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [15, 22, 15] },
        margin: { left: margin, right: margin },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ── Risk assessment ───────────────────────────────────────────────────
      y = section("RISK ASSESSMENT", y);
      autoTable(doc, {
        startY: y,
        head: [["Risk Category", "Score", "Severity"]],
        body: [
          ["Drought Risk", reportData.risk.droughtRisk, reportData.risk.droughtRisk >= 75 ? "Critical" : reportData.risk.droughtRisk >= 50 ? "High" : reportData.risk.droughtRisk >= 25 ? "Medium" : "Low"],
          ["Heat Stress", reportData.risk.heatStressRisk, reportData.risk.heatStressRisk >= 75 ? "Critical" : "Low"],
          ["Vegetation Decline", reportData.risk.vegetationDeclineRisk, reportData.risk.vegetationDeclineRisk >= 50 ? "High" : "Low"],
          ["Irrigation Stress", reportData.risk.irrigationStressRisk, reportData.risk.irrigationStressRisk >= 50 ? "High" : "Low"],
          ["Overall Risk", reportData.risk.overallRisk, reportData.risk.severity.toUpperCase()],
        ],
        theme: "plain",
        styles: { textColor: [229, 231, 235], fontSize: 9, fillColor: [9, 14, 9] },
        headStyles: { fillColor: [20, 28, 20], textColor: [74, 222, 128], fontSize: 8, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [15, 22, 15] },
        margin: { left: margin, right: margin },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ── Evidence log ──────────────────────────────────────────────────────
      y = section("FIELD EVIDENCE LOG", y);
      if (reportData.evidence.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [["Title", "Type", "GPS Status", "Date", "Status"]],
          body: reportData.evidence.slice(0, 10).map((e) => [
            e.title.substring(0, 30),
            e.type.replace("_", " "),
            e.gpsValidation === "valid" ? "Validated" : "Unvalidated",
            new Date(e.capturedAt).toLocaleDateString("en-IN"),
            e.status,
          ]),
          theme: "plain",
          styles: { textColor: [229, 231, 235], fontSize: 8, fillColor: [9, 14, 9] },
          headStyles: { fillColor: [20, 28, 20], textColor: [74, 222, 128], fontSize: 7, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [15, 22, 15] },
          margin: { left: margin, right: margin },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      } else {
        addText("No field evidence submitted for this period.", margin, y, { fontSize: 9, color: "#6b7280" });
        y += 10;
      }

      // ── Methodology ───────────────────────────────────────────────────────
      if (y > pageH - 60) { doc.addPage(); doc.setFillColor(9, 14, 9); doc.rect(0, 0, pageW, pageH, "F"); y = margin; }
      y = section("METHODOLOGY & STANDARDS", y);
      reportData.methodology.forEach((m) => {
        addText(`• ${m}`, margin + 2, y, { fontSize: 8, color: "#6b7280" });
        y += 6;
      });
      y += 4;

      // ── Certification note ────────────────────────────────────────────────
      doc.setFillColor(16, 28, 16);
      doc.rect(margin, y, contentW, 18, "F");
      addText(reportData.certificationNote, margin + 3, y + 7, { fontSize: 8, color: "#4ade80", bold: true });
      addText("VASUDHA Climate Intelligence Platform · vasudha.ai", margin + 3, y + 13, { fontSize: 7, color: "#4b5563" });

      // Save
      const name = fileName ?? `VASUDHA_MRV_${reportData.farm.name.replace(/\s+/g, "_")}_${reportData.period.start}.pdf`;
      doc.save(name);
      toast.success("PDF report downloaded");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button variant="primary" size="sm" onClick={generatePDF} disabled={generating}>
      {generating ? (
        <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</>
      ) : (
        <><Download className="w-3.5 h-3.5" /> Download PDF</>
      )}
    </Button>
  );
}
