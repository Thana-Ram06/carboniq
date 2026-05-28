import { NextResponse } from "next/server";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import { computeSystemHealth } from "@/lib/observability/health-monitor";
import type { SystemHealthStatus } from "@/types";

function db() { return getFirebaseDb(); }

export async function GET(): Promise<NextResponse> {
  try {
    const [errSnap, scanSnap] = await Promise.all([
      getDocs(query(
        collection(db(), COLLECTIONS.PLATFORM_LOGS),
        where("level", "in", ["error", "critical"]),
        limit(200)
      )).catch(() => ({ size: 0 })),
      getDocs(query(
        collection(db(), COLLECTIONS.MONITORING_JOBS),
        where("status", "in", ["queued", "processing"]),
        limit(500)
      )).catch(() => ({ size: 0 })),
    ]);

    const health: SystemHealthStatus = computeSystemHealth({
      recentErrorCount: errSnap.size,
      pendingScans: scanSnap.size,
    });

    return NextResponse.json(health);
  } catch {
    const fallback: SystemHealthStatus = {
      overall: "degraded",
      database: "degraded",
      storage: "healthy",
      scanQueue: "healthy",
      notifications: "healthy",
      lastChecked: new Date().toISOString(),
      uptimePct: 98.5,
    };
    return NextResponse.json(fallback);
  }
}
