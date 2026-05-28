"use client";

import { useState } from "react";
import {
  CheckCircle2, XCircle, RefreshCw, ClipboardList, User, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditStatusBadge } from "./AuditStatusBadge";
import type { AuditReview, AuditStatus, AuditChecklistItem } from "@/types";
import toast from "react-hot-toast";

const DEFAULT_CHECKLIST: AuditChecklistItem[] = [
  { id: "ndvi_verified", label: "NDVI data verified and consistent", passed: false },
  { id: "boundary_confirmed", label: "Farm boundary polygon confirmed", passed: false },
  { id: "evidence_reviewed", label: "Field evidence photos reviewed", passed: false },
  { id: "carbon_validated", label: "Carbon calculation methodology validated", passed: false },
  { id: "risk_assessed", label: "Risk assessment findings reviewed", passed: false },
];

interface AuditPanelProps {
  farmId: string;
  userId: string;
  auditorId: string;
  auditorName?: string;
  existingReview?: AuditReview | null;
  ndviAverage?: number;
  carbonScoreTonnes?: number;
  evidenceCount?: number;
  periodStart: string;
  periodEnd: string;
  onComplete?: (review: AuditReview) => void;
}

export function AuditPanel({
  farmId, userId, auditorId, auditorName,
  existingReview, ndviAverage, carbonScoreTonnes,
  evidenceCount = 0, periodStart, periodEnd, onComplete,
}: AuditPanelProps) {
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>(
    existingReview?.checklistItems ?? DEFAULT_CHECKLIST
  );
  const [comments, setComments] = useState(existingReview?.comments ?? "");
  const [submitting, setSubmitting] = useState(false);

  const passedCount = checklist.filter((c) => c.passed).length;
  const confidence = Math.round((passedCount / checklist.length) * 100);

  const toggleCheck = (id: string) => {
    setChecklist((prev) => prev.map((c) => c.id === id ? { ...c, passed: !c.passed } : c));
  };

  const submitAudit = async (status: AuditStatus) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/audit/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: existingReview ? "update" : "create",
          reviewId: existingReview?.id,
          farmId, userId, auditorId, auditorName, status,
          periodStart, periodEnd, ndviAverage, carbonScoreTonnes,
          evidenceCount,
          validatedEvidenceCount: evidenceCount,
          comments, checklistItems: checklist, confidence,
        }),
      });
      const data = await res.json() as { reviewId: string; status: AuditStatus };
      if (!res.ok) throw new Error("Audit submission failed");

      const review: AuditReview = {
        id: data.reviewId,
        farmId, userId, auditorId, auditorName,
        status: data.status,
        periodStart, periodEnd,
        ndviAverage, carbonScoreTonnes,
        evidenceCount, validatedEvidenceCount: evidenceCount,
        comments, checklistItems: checklist, confidence,
        createdAt: existingReview?.createdAt ?? ({} as never),
        updatedAt: {} as never,
      };

      const labels: Record<AuditStatus, string> = {
        approved: "Audit approved",
        rejected: "Audit rejected",
        requires_recheck: "Marked for recheck",
        in_review: "Marked in review",
        pending: "Saved as pending",
      };
      toast.success(labels[status] ?? "Audit submitted");
      onComplete?.(review);
    } catch {
      toast.error("Failed to submit audit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Checklist */}
      <div>
        <p className="text-xs font-medium text-muted-foreground/60 mb-3 flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" />
          Verification Checklist
          <span className="ml-auto font-mono text-foreground">{passedCount}/{checklist.length}</span>
        </p>
        <div className="space-y-2">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                item.passed
                  ? "bg-green-500/8 border-green-500/20"
                  : "bg-muted border-border hover:border-green-500/20"
              }`}
            >
              <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${
                item.passed ? "bg-green-500 border-green-500" : "border-muted-foreground/30"
              }`}>
                {item.passed && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-xs ${item.passed ? "text-foreground" : "text-muted-foreground/70"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Confidence meter */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground/60">Audit Confidence</span>
          <span className="font-mono text-foreground">{confidence}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${confidence}%`,
              background: confidence >= 80 ? "#4ade80" : confidence >= 60 ? "#fbbf24" : "#f97316",
            }}
          />
        </div>
      </div>

      {/* Period + auditor */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-muted border border-border">
          <p className="text-muted-foreground/50 mb-0.5">Period</p>
          <p className="text-foreground font-medium">{periodStart} → {periodEnd}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-muted border border-border">
          <p className="text-muted-foreground/50 mb-0.5 flex items-center gap-1"><User className="w-2.5 h-2.5" />Auditor</p>
          <p className="text-foreground font-medium truncate">{auditorName ?? auditorId}</p>
        </div>
      </div>

      {/* Comments */}
      <div>
        <p className="text-xs text-muted-foreground/60 mb-1.5 flex items-center gap-1.5">
          <MessageSquare className="w-3 h-3" /> Auditor Comments
        </p>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          placeholder="Add verification notes, observations, or rejection reasons..."
          className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-green-500/40 transition-colors"
        />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={submitting}
          onClick={() => submitAudit("requires_recheck")}
          className="text-orange-400 border-orange-500/20 hover:bg-orange-500/10 text-xs"
        >
          <RefreshCw className="w-3 h-3" /> Recheck
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={submitting}
          onClick={() => submitAudit("rejected")}
          className="text-red-400 border-red-500/20 hover:bg-red-500/10 text-xs"
        >
          <XCircle className="w-3 h-3" /> Reject
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={submitting || passedCount < 3}
          onClick={() => submitAudit("approved")}
          className="text-xs"
        >
          <CheckCircle2 className="w-3 h-3" />
          {submitting ? "Saving…" : "Approve"}
        </Button>
      </div>

      {existingReview && (
        <div className="flex items-center justify-between">
          <AuditStatusBadge status={existingReview.status} size="sm" />
          <span className="text-[10px] text-muted-foreground/40">
            Last updated recently
          </span>
        </div>
      )}
    </div>
  );
}
