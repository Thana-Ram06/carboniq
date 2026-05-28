"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck, ClipboardList, CheckCircle2, RefreshCw, TrendingUp, Leaf,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditPanel } from "@/components/audit/AuditPanel";
import { AuditStatusBadge } from "@/components/audit/AuditStatusBadge";
import { ConfidenceScoreWidget } from "@/components/verification/ConfidenceScore";
import { useAuth } from "@/hooks/use-auth";
import { useFarms } from "@/hooks/use-farms";
import { getFarmAuditHistory, getFarmEvidence } from "@/lib/firestore";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";
import { assessRisk } from "@/lib/monitoring/risk-engine";
import { computeConfidenceScore } from "@/lib/verification/confidence-engine";
import type { AuditReview, FarmEvidence } from "@/types";
import type { Farm } from "@/types";

export default function AuditPage() {
  const { user } = useAuth();
  const { farms, loading: farmsLoading } = useFarms(user?.uid ?? null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditReview[]>([]);
  const [evidence, setEvidence] = useState<FarmEvidence[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];

  useEffect(() => {
    if (farms.length > 0 && !selectedFarmId) setSelectedFarmId(farms[0].id);
  }, [farms, selectedFarmId]);

  const loadAuditData = useCallback(async (farmId: string) => {
    setLoading(true);
    try {
      const [history, ev] = await Promise.all([
        getFarmAuditHistory(farmId, 10),
        getFarmEvidence(farmId, 30),
      ]);
      setAuditHistory(history);
      setEvidence(ev);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFarmId) loadAuditData(selectedFarmId);
  }, [selectedFarmId, loadAuditData]);

  const farmIntelligence = useMemo(() => {
    if (!selectedFarm) return null;
    const ndviResult = computeFarmNDVI({
      farmId: selectedFarm.id,
      cropType: selectedFarm.cropType,
      irrigationType: selectedFarm.irrigationType,
      state: selectedFarm.state,
      areaHectares: selectedFarm.areaHectares,
    });
    const ndvi = ndviResult.current.ndvi;
    const carbon = computeCarbonIntelligence(selectedFarm, ndvi);
    const risk = assessRisk(selectedFarm, ndvi, null);
    return { ndvi, carbon, risk };
  }, [selectedFarm]);

  const confidence = useMemo(() => {
    if (!farmIntelligence) return null;
    const latestAudit = auditHistory[0] ?? null;
    return computeConfidenceScore({
      ndvi: farmIntelligence.ndvi,
      riskScore: farmIntelligence.risk.overallRisk,
      evidence,
      audit: latestAudit,
    });
  }, [farmIntelligence, evidence, auditHistory]);

  const globalStats = useMemo(() => {
    return {
      pendingFarms: farms.filter((f: Farm) => f.status === "active").length,
      approvedCount: auditHistory.filter((a) => a.status === "approved").length,
      recheckCount: auditHistory.filter((a) => a.status === "requires_recheck").length,
      totalReviews: auditHistory.length,
    };
  }, [farms, auditHistory]);

  const today = new Date().toISOString().split("T")[0];
  const periodStart = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  if (farmsLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-card rounded-xl w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-64 bg-card rounded-2xl" />
          <div className="lg:col-span-2 h-64 bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-400" />
            Audit & Verification
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            MRV audit workflows — review, approve, and certify farm carbon data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />{globalStats.approvedCount} approved</span>
            <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-orange-400" />{globalStats.recheckCount} recheck</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Farms to Audit", value: globalStats.pendingFarms, icon: ClipboardList, color: "text-yellow-400" },
          { label: "Total Reviews", value: globalStats.totalReviews, icon: ShieldCheck, color: "text-blue-400" },
          { label: "Approved", value: globalStats.approvedCount, icon: CheckCircle2, color: "text-green-400" },
          { label: "Need Recheck", value: globalStats.recheckCount, icon: RefreshCw, color: "text-orange-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <p className="text-xs text-muted-foreground/50">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Farm selector + confidence */}
        <div className="space-y-4">
          {/* Farm selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Farm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {farms.map((farm) => {
                  const latestAudit = auditHistory.find((a) => a.farmId === farm.id);
                  return (
                    <button
                      key={farm.id}
                      onClick={() => setSelectedFarmId(farm.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        selectedFarmId === farm.id
                          ? "border-green-500/30 bg-green-500/8"
                          : "border-border bg-muted hover:border-green-500/20"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${selectedFarmId === farm.id ? "bg-green-400" : "bg-muted-foreground/30"}`} />
                      <span className="text-sm text-foreground flex-1 truncate">{farm.name}</span>
                      {latestAudit && <AuditStatusBadge status={latestAudit.status} size="sm" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Confidence score */}
          {confidence && (
            <Card>
              <CardHeader>
                <CardTitle>MRV Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <ConfidenceScoreWidget score={confidence} />
              </CardContent>
            </Card>
          )}

          {/* Farm metrics */}
          {farmIntelligence && selectedFarm && (
            <Card>
              <CardHeader><CardTitle>Farm Intelligence</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-muted border border-border">
                    <p className="text-[10px] text-muted-foreground/50 mb-0.5 flex items-center gap-1"><Leaf className="w-2.5 h-2.5" />NDVI</p>
                    <p className="text-sm font-bold font-mono text-green-400">{farmIntelligence.ndvi.toFixed(3)}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted border border-border">
                    <p className="text-[10px] text-muted-foreground/50 mb-0.5 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" />CO₂e</p>
                    <p className="text-sm font-bold font-mono text-emerald-400">{farmIntelligence.carbon.carbonScoreTonnes.toFixed(1)}t</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted border border-border">
                    <p className="text-[10px] text-muted-foreground/50 mb-0.5">Evidence</p>
                    <p className="text-sm font-bold text-foreground">{evidence.length}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted border border-border">
                    <p className="text-[10px] text-muted-foreground/50 mb-0.5">Area</p>
                    <p className="text-sm font-bold text-foreground">{selectedFarm.areaHectares.toFixed(1)} ha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Audit panel + history */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active audit panel */}
          {selectedFarm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-muted-foreground/60" />
                    Audit Review — {selectedFarm.name}
                  </CardTitle>
                  {auditHistory[0] && <AuditStatusBadge status={auditHistory[0].status} />}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}
                  </div>
                ) : (
                  <AuditPanel
                    farmId={selectedFarm.id}
                    userId={user?.uid ?? ""}
                    auditorId={user?.uid ?? ""}
                    auditorName={user?.displayName ?? "Auditor"}
                    existingReview={auditHistory[0] ?? null}
                    ndviAverage={farmIntelligence?.ndvi}
                    carbonScoreTonnes={farmIntelligence?.carbon.carbonScoreTonnes}
                    evidenceCount={evidence.length}
                    periodStart={periodStart}
                    periodEnd={today}
                    onComplete={() => loadAuditData(selectedFarm.id)}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground/50 text-sm">
              Select a farm to begin audit review
            </div>
          )}

          {/* Audit history */}
          {auditHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground/60" />
                  Audit History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditHistory.map((review) => (
                    <div key={review.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted">
                      <AuditStatusBadge status={review.status} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground/70 truncate">{review.comments || "No comments"}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/40">
                          <span>{review.periodStart} → {review.periodEnd}</span>
                          {review.confidence > 0 && <span>Confidence: {review.confidence}%</span>}
                          {review.auditorName && <span>by {review.auditorName}</span>}
                        </div>
                      </div>
                      <Badge variant={
                        review.checklistItems.filter((c) => c.passed).length === review.checklistItems.length ? "green" :
                        review.checklistItems.filter((c) => c.passed).length >= 3 ? "yellow" : "red"
                      } size="sm">
                        {review.checklistItems.filter((c) => c.passed).length}/{review.checklistItems.length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
