"use client";

import { useEffect, useState } from "react";
import { Activity, Database, HardDrive, Bell, Cpu, RefreshCw } from "lucide-react";
import type { SystemHealthStatus, HealthStatus } from "@/types";
import { healthColor, healthBg, healthDot } from "@/lib/observability/health-monitor";

const SERVICES = [
  { key: "database",      label: "Firestore DB",   icon: Database },
  { key: "storage",       label: "Firebase Storage", icon: HardDrive },
  { key: "scanQueue",     label: "Scan Queue",     icon: Cpu },
  { key: "notifications", label: "Notifications",  icon: Bell },
] as const;

function StatusDot({ status }: { status: HealthStatus }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${healthDot(status)} ${status !== "healthy" ? "animate-pulse" : ""}`} />
  );
}

export function PlatformHealth() {
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchHealth() {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch {
      // Silently degrade
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-foreground">Platform Health</h3>
        </div>
        <button
          onClick={fetchHealth}
          className="w-7 h-7 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : health ? (
        <>
          {/* Overall status */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border mb-3 ${healthBg(health.overall)}`}>
            <StatusDot status={health.overall} />
            <div className="flex-1">
              <p className={`text-sm font-semibold capitalize ${healthColor(health.overall)}`}>
                {health.overall === "healthy" ? "All Systems Operational" : `System ${health.overall}`}
              </p>
              <p className="text-[10px] text-muted-foreground/50">
                Uptime {health.uptimePct}% · Checked {new Date(health.lastChecked).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Service breakdown */}
          <div className="space-y-1.5">
            {SERVICES.map(({ key, label, icon: Icon }) => {
              const status = health[key];
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-muted/30"
                >
                  <Icon className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                  <span className="flex-1 text-xs text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={status} />
                    <span className={`text-[10px] font-medium capitalize ${healthColor(status)}`}>{status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground/50 text-center py-4">Unable to fetch health status</p>
      )}
    </div>
  );
}
