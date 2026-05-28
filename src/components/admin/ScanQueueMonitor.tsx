"use client";

import { useEffect, useState } from "react";
import { Cpu, Clock, CheckCircle2, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";

interface ScanJob {
  id: string;
  farmId: string;
  userId: string;
  status: "pending" | "queued" | "processing" | "completed" | "failed" | "retrying";
  priority: "low" | "normal" | "high";
  triggeredBy: string;
  retryCount?: number;
  error?: string;
  createdAt?: { seconds: number };
}

const STATUS_CONFIG = {
  pending:    { color: "text-muted-foreground/50", icon: Clock },
  queued:     { color: "text-yellow-400",  icon: Clock },
  processing: { color: "text-blue-400",    icon: Loader2 },
  completed:  { color: "text-green-400",   icon: CheckCircle2 },
  failed:     { color: "text-red-400",     icon: XCircle },
  retrying:   { color: "text-orange-400",  icon: RefreshCw },
} as const;

export function ScanQueueMonitor() {
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTIONS.MONITORING_JOBS),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ScanJob));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const counts = {
    active: jobs.filter((j) => ["queued", "processing", "retrying"].includes(j.status)).length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-foreground">Scan Queue</h3>
        <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground/50">
          <span className="text-cyan-400">{counts.active} active</span>
          <span className="text-green-400">{counts.completed} done</span>
          <span className="text-red-400">{counts.failed} failed</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0,1,2].map((i) => <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-xs text-muted-foreground/50 text-center py-6">No scan jobs</p>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {jobs.map((job) => {
            const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <div
                key={job.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-muted/20"
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color} ${job.status === "processing" ? "animate-spin" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate font-mono">{job.farmId.slice(0, 8)}…</p>
                  {job.error && (
                    <p className="text-[10px] text-red-400/70 truncate">{job.error}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] font-medium capitalize ${cfg.color}`}>{job.status}</span>
                  <p className="text-[10px] text-muted-foreground/30">{job.priority}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
