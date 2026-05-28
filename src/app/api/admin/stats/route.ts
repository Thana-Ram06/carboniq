import { NextResponse } from "next/server";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import type { AdminPlatformStats } from "@/types";

function db() { return getFirebaseDb(); }

async function countCollection(col: string, ...constraints: Parameters<typeof query>[1][]): Promise<number> {
  try {
    const q = query(collection(db(), col), ...constraints, limit(1000));
    const snap = await getDocs(q);
    return snap.size;
  } catch {
    return 0;
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const [totalFarms, totalEvidence, pendingAudits, activeScans, totalPilots, totalCampaigns] =
      await Promise.all([
        countCollection(COLLECTIONS.FARMS),
        countCollection(COLLECTIONS.FARM_EVIDENCE),
        countCollection(COLLECTIONS.AUDIT_REVIEWS, where("status", "in", ["pending", "in_review"])),
        countCollection(COLLECTIONS.MONITORING_JOBS, where("status", "in", ["queued", "processing"])),
        countCollection(COLLECTIONS.PILOT_ORGS, where("status", "==", "active")),
        countCollection(COLLECTIONS.FIELD_CAMPAIGNS),
      ]);

    // User count from user_profiles
    const usersSnap = await getDocs(query(collection(db(), COLLECTIONS.USER_PROFILES), limit(1000)));
    const totalUsers = usersSnap.size;

    // Area and carbon from farms
    let totalAreaHa = 0;
    let totalCarbonTonnes = 0;
    const farmsSnap = await getDocs(query(collection(db(), COLLECTIONS.FARMS), limit(500)));
    farmsSnap.docs.forEach((d) => {
      const data = d.data();
      totalAreaHa += data.areaHectares ?? 0;
      totalCarbonTonnes += (data.areaHectares ?? 0) * 0.62;
    });

    // Error count 24h
    let errorCount24h = 0;
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const errSnap = await getDocs(
        query(
          collection(db(), COLLECTIONS.PLATFORM_LOGS),
          where("level", "in", ["error", "critical"]),
          orderBy("createdAt", "desc"),
          limit(200)
        )
      );
      errorCount24h = errSnap.docs.filter((d) => {
        const ts = d.data().createdAt?.toDate?.();
        return ts && ts >= since;
      }).length;
    } catch {
      errorCount24h = 0;
    }

    const stats: AdminPlatformStats = {
      totalUsers,
      totalFarms,
      totalAreaHa: parseFloat(totalAreaHa.toFixed(1)),
      totalEvidence,
      pendingAudits,
      activeScans,
      errorCount24h,
      totalCarbonTonnes: parseFloat(totalCarbonTonnes.toFixed(1)),
      activePilots: totalPilots,
      totalCampaigns,
    };

    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
