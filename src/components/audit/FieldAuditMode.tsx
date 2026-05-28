"use client";

import { useState } from "react";
import {
  ShieldCheck, CheckCircle2, XCircle, RefreshCw,
  MapPin, Leaf, ChevronRight, FileText,
} from "lucide-react";
import type { Farm, AuditChecklistItem } from "@/types";
import { AuditStatusBadge } from "@/components/audit/AuditStatusBadge";

const QUICK_CHECKLIST: AuditChecklistItem[] = [
  { id: "ndvi_verified",       label: "NDVI data verified",           passed: false },
  { id: "boundary_confirmed",  label: "Farm boundary confirmed",       passed: false },
  { id: "evidence_reviewed",   label: "Field evidence reviewed",       passed: false },
  { id: "carbon_validated",    label: "Carbon calculation validated",  passed: false },
  { id: "risk_assessed",       label: "Risk assessment reviewed",      passed: false },
];

interface FieldAuditModeProps {
  farm: Farm;
  ndvi?: number;
  carbonTonnes?: number;
  evidenceCount?: number;
  onSubmit: (status: "approved" | "rejected" | "requires_recheck", checklist: AuditChecklistItem[], notes: string) => void;
}

export function FieldAuditMode({ farm, ndvi, carbonTonnes, evidenceCount, onSubmit }: FieldAuditModeProps) {
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>(QUICK_CHECKLIST);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const passedCount = checklist.filter((c) => c.passed).length;
  const allPassed = passedCount === checklist.length;

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleSubmit = async (status: "approved" | "rejected" | "requires_recheck") => {
    setSubmitting(true);
    await onSubmit(status, checklist, notes);
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Farm info strip */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
        <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{farm.name}</p>
          <p className="text-xs text-muted-foreground/60">{farm.district}, {farm.state} · {farm.areaHectares.toFixed(1)} ha</p>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-3 gap-2">
        {ndvi !== undefined && (
          <div className="p-2.5 rounded-xl bg-muted border border-border text-center">
            <Leaf className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
            <p className="text-xs font-bold font-mono text-green-400">{ndvi.toFixed(3)}</p>
            <p className="text-[9px] text-muted-foreground/50">NDVI</p>
          </div>
        )}
        {carbonTonnes !== undefined && (
          <div className="p-2.5 rounded-xl bg-muted border border-border text-center">
            <FileText className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs font-bold font-mono text-emerald-400">{carbonTonnes.toFixed(1)}t</p>
            <p className="text-[9px] text-muted-foreground/50">CO₂e</p>
          </div>
        )}
        {evidenceCount !== undefined && (
          <div className="p-2.5 rounded-xl bg-muted border border-border text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-blue-400">{evidenceCount}</p>
            <p className="text-[9px] text-muted-foreground/50">Evidence</p>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground">Verification Checklist</p>
          <span className={`text-xs font-bold ${allPassed ? "text-green-400" : "text-muted-foreground"}`}>
            {passedCount}/{checklist.length}
          </span>
        </div>
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
              item.passed
                ? "border-green-500/30 bg-green-500/8"
                : "border-border bg-muted hover:border-green-500/15"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              item.passed ? "border-green-400 bg-green-400" : "border-muted-foreground/30"
            }`}>
              {item.passed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className={`text-sm flex-1 ${item.passed ? "text-green-300" : "text-foreground"}`}>
              {item.label}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${item.passed ? "text-green-400/40" : "text-muted-foreground/30"}`} />
          </button>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-muted-foreground/60 mb-1.5 block">
          Auditor Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Field observations, issues found, recommendations…"
          className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-green-500/30 resize-none"
        />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          disabled={submitting}
          onClick={() => handleSubmit("requires_recheck")}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs font-medium hover:bg-yellow-500/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Recheck
        </button>
        <button
          disabled={submitting}
          onClick={() => handleSubmit("rejected")}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
        <button
          disabled={submitting || passedCount === 0}
          onClick={() => handleSubmit("approved")}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-medium hover:bg-green-500/15 transition-all active:scale-95 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-green-400 transition-all duration-300"
            style={{ width: `${(passedCount / checklist.length) * 100}%` }}
          />
        </div>
        <AuditStatusBadge status={allPassed ? "approved" : passedCount > 0 ? "in_review" : "pending"} size="sm" />
      </div>
    </div>
  );
}
