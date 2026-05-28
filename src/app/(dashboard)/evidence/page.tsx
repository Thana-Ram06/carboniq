"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, Upload, CheckCircle2, AlertTriangle, Filter, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceUploader } from "@/components/evidence/EvidenceUploader";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import { useAuth } from "@/hooks/use-auth";
import { useFarms } from "@/hooks/use-farms";
import { getUserEvidence } from "@/lib/firestore";
import type { FarmEvidence } from "@/types";

export default function EvidencePage() {
  const { user } = useAuth();
  const { farms, loading: farmsLoading } = useFarms(user?.uid ?? null);
  const [evidence, setEvidence] = useState<FarmEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FarmEvidence["status"] | "all">("all");
  const [showUploader, setShowUploader] = useState(false);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];

  const loadEvidence = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const ev = await getUserEvidence(user.uid, 50);
      setEvidence(ev);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { loadEvidence(); }, [loadEvidence]);

  useEffect(() => {
    if (farms.length > 0 && !selectedFarmId) setSelectedFarmId(farms[0].id);
  }, [farms, selectedFarmId]);

  const filteredEvidence = evidence.filter((ev) => {
    const farmMatch = !selectedFarmId || ev.farmId === selectedFarmId;
    const statusMatch = filterStatus === "all" || ev.status === filterStatus;
    return farmMatch && statusMatch;
  });

  const stats = {
    total: evidence.length,
    validated: evidence.filter((e) => e.status === "validated").length,
    gpsValid: evidence.filter((e) => e.gpsValidation === "valid").length,
    pending: evidence.filter((e) => e.status === "pending").length,
  };

  const handleUploaded = useCallback(() => {
    setShowUploader(false);
    loadEvidence();
  }, [loadEvidence]);

  if (farmsLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-card rounded-xl w-64" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-card rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Field Evidence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Geo-tagged evidence collection for MRV verification workflows
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowUploader(!showUploader)}>
          <Upload className="w-4 h-4" />
          {showUploader ? "Hide Uploader" : "Upload Evidence"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Evidence", value: stats.total, icon: Camera, color: "text-foreground" },
          { label: "GPS Validated", value: stats.gpsValid, icon: MapPin, color: "text-green-400" },
          { label: "Verified", value: stats.validated, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Pending Review", value: stats.pending, icon: AlertTriangle, color: "text-yellow-400" },
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
        {/* Uploader + Farm Selector */}
        <div className="space-y-4">
          {/* Farm selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Farm</CardTitle>
            </CardHeader>
            <CardContent>
              {farms.length === 0 ? (
                <p className="text-sm text-muted-foreground/50">No farms registered</p>
              ) : (
                <div className="space-y-1.5">
                  {farms.map((farm) => {
                    const farmEvCount = evidence.filter((e) => e.farmId === farm.id).length;
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
                        <Badge variant="gray" size="sm">{farmEvCount}</Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploader */}
          {showUploader && selectedFarm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-400" />
                  Upload Evidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EvidenceUploader
                  farm={selectedFarm}
                  userId={user?.uid ?? ""}
                  onUploaded={() => handleUploaded()}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Evidence list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-muted-foreground/60" />
                  Evidence Log
                  {selectedFarm && <span className="text-muted-foreground/50 text-sm font-normal">— {selectedFarm.name}</span>}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="text-xs bg-muted border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="validated">Validated</option>
                    <option value="rejected">Rejected</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-muted border border-border animate-pulse" />
                  ))}
                </div>
              ) : filteredEvidence.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-3xl bg-muted border border-border flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">No evidence yet</p>
                  <p className="text-xs text-muted-foreground/50 max-w-xs">
                    Upload geo-tagged field photos, measurements, and notes to build your verification record.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowUploader(true)}>
                    <Upload className="w-3.5 h-3.5" /> Upload First Evidence
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvidence.map((ev) => (
                    <EvidenceCard key={ev.id} evidence={ev} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
