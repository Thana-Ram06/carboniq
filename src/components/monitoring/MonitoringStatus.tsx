"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Farm } from "@/types";
import {
  formatLastScan,
  formatNextScan,
  isScanDue,
} from "@/lib/monitoring/scheduler";
import type { MonitoringConfig } from "@/types";
import toast from "react-hot-toast";

type ScanRecord = {
  farmId: string;
  farmName: string;
  status: "queued" | "processing" | "completed" | "failed";
  ndvi?: number;
  riskSeverity?: string;
  alertCount?: number;
  scannedAt?: string;
  error?: string;
};

interface MonitoringStatusProps {
  farms: Farm[];
  userId: string;
}

export function MonitoringStatus({ farms, userId }: MonitoringStatusProps) {
  const [scanQueue, setScanQueue] = useState<ScanRecord[]>([]);
  const [triggering, setTriggering] = useState(false);

  const dueFarms = farms.filter((f) => {
    const m = (f as typeof f & { monitoring?: MonitoringConfig }).monitoring;
    return m?.autoEnabled && isScanDue(m.nextScanAt);
  });

  const triggerScans = useCallback(
    async (farmIds: string[]) => {
      if (!farmIds.length) {
        toast("No farms due for scanning");
        return;
      }
      setTriggering(true);

      // Enqueue
      const newRecords: ScanRecord[] = farmIds.map((id) => ({
        farmId: id,
        farmName: farms.find((f) => f.id === id)?.name ?? id,
        status: "queued",
      }));
      setScanQueue((prev) => [...newRecords, ...prev].slice(0, 10));

      // Mark as processing
      setScanQueue((prev) =>
        prev.map((r) =>
          farmIds.includes(r.farmId) && r.status === "queued"
            ? { ...r, status: "processing" }
            : r
        )
      );

      try {
        const res = await fetch("/api/monitoring/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ farmIds, userId, triggeredBy: "manual" }),
        });
        const data = (await res.json()) as {
          results: {
            farmId: string;
            ndvi: number;
            riskSeverity: string;
            alertCount: number;
            scannedAt: string;
          }[];
          errors: { farmId: string; error: string }[];
        };

        setScanQueue((prev) =>
          prev.map((r) => {
            const success = data.results.find((s) => s.farmId === r.farmId);
            const failure = data.errors.find((e) => e.farmId === r.farmId);
            if (success)
              return {
                ...r,
                status: "completed",
                ndvi: success.ndvi,
                riskSeverity: success.riskSeverity,
                alertCount: success.alertCount,
                scannedAt: success.scannedAt,
              };
            if (failure)
              return { ...r, status: "failed", error: failure.error };
            return r;
          })
        );

        const { results } = data;
        if (results.length > 0) {
          toast.success(`${results.length} farm${results.length !== 1 ? "s" : ""} scanned`);
        }
      } catch {
        setScanQueue((prev) =>
          prev.map((r) =>
            farmIds.includes(r.farmId) && r.status === "processing"
              ? { ...r, status: "failed", error: "Network error" }
              : r
          )
        );
        toast.error("Monitoring trigger failed");
      } finally {
        setTriggering(false);
      }
    },
    [farms, userId]
  );

  // Auto-trigger on load if any farms are due
  useEffect(() => {
    if (dueFarms.length > 0) {
      triggerScans(dueFarms.map((f) => f.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusIcon = (status: ScanRecord["status"]) => {
    if (status === "completed") return <CheckCircle2 className="w-3 h-3 text-green-400" />;
    if (status === "failed") return <XCircle className="w-3 h-3 text-red-400" />;
    if (status === "processing") return <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />;
    return <Clock className="w-3 h-3 text-muted-foreground/40" />;
  };

  return (
    <div className="space-y-3">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-muted border border-border text-center">
          <p className="text-lg font-bold text-foreground">{farms.length}</p>
          <p className="text-[10px] text-muted-foreground/50">Total</p>
        </div>
        <div className={`p-2.5 rounded-xl border text-center ${dueFarms.length > 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-muted border-border"}`}>
          <p className={`text-lg font-bold ${dueFarms.length > 0 ? "text-yellow-400" : "text-foreground"}`}>
            {dueFarms.length}
          </p>
          <p className="text-[10px] text-muted-foreground/50">Due</p>
        </div>
        <div className="p-2.5 rounded-xl bg-green-500/8 border border-green-500/15 text-center">
          <p className="text-lg font-bold text-green-400">
            {scanQueue.filter((s) => s.status === "completed").length}
          </p>
          <p className="text-[10px] text-muted-foreground/50">Done</p>
        </div>
      </div>

      {/* Farm monitoring schedule */}
      <div className="space-y-1.5">
        {farms.slice(0, 5).map((farm) => {
          const m = (farm as typeof farm & { monitoring?: MonitoringConfig }).monitoring;
          const queueEntry = scanQueue.find((s) => s.farmId === farm.id);
          return (
            <div
              key={farm.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted border border-border"
            >
              {queueEntry ? (
                statusIcon(queueEntry.status)
              ) : (
                <div className="w-2 h-2 rounded-full bg-green-500/40" />
              )}
              <span className="text-xs text-foreground flex-1 truncate">
                {farm.name}
              </span>
              {queueEntry?.status === "completed" && queueEntry.riskSeverity ? (
                <Badge
                  variant={
                    queueEntry.riskSeverity === "critical" || queueEntry.riskSeverity === "high"
                      ? "red"
                      : queueEntry.riskSeverity === "medium"
                      ? "yellow"
                      : "green"
                  }
                  size="sm"
                >
                  {queueEntry.riskSeverity}
                </Badge>
              ) : m?.lastScanAt ? (
                <span className="text-[10px] text-muted-foreground/40">
                  {formatLastScan(m.lastScanAt)}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground/40">
                  {formatNextScan(m?.nextScanAt)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        disabled={triggering || farms.length === 0}
        onClick={() => triggerScans(farms.map((f) => f.id))}
      >
        {triggering ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <Zap className="w-3 h-3" />
        )}
        {triggering ? "Running scans…" : "Run All Scans Now"}
      </Button>

      {/* Active alerts summary */}
      {scanQueue.some((s) => s.status === "completed" && (s.alertCount ?? 0) > 0) && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-yellow-500/8 border border-yellow-500/15">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-300">
            {scanQueue
              .filter((s) => s.status === "completed")
              .reduce((acc, s) => acc + (s.alertCount ?? 0), 0)}{" "}
            alert{scanQueue.reduce((acc, s) => acc + (s.alertCount ?? 0), 0) !== 1 ? "s" : ""} detected across farms
          </p>
        </div>
      )}
    </div>
  );
}
