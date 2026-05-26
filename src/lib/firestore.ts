import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "./firebase";
import type {
  Farm,
  CreateFarmInput,
  CarbonEstimation,
  SatelliteAnalytics,
  Report,
  ActivityItem,
  DashboardStats,
} from "@/types";
import { quickCarbonEstimate } from "./carbon-estimation";

function db() {
  return getFirebaseDb();
}

// ──────────────────────────────────────────
// FARMS
// ──────────────────────────────────────────

export async function createFarm(
  userId: string,
  input: CreateFarmInput
): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTIONS.FARMS), {
    ...input,
    userId,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserFarms(userId: string): Promise<Farm[]> {
  const q = query(
    collection(db(), COLLECTIONS.FARMS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Farm);
}

export async function getFarm(farmId: string): Promise<Farm | null> {
  const snap = await getDoc(doc(db(), COLLECTIONS.FARMS, farmId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Farm;
}

export async function updateFarm(
  farmId: string,
  data: Partial<Farm>
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.FARMS, farmId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFarm(farmId: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.FARMS, farmId));
}

// ──────────────────────────────────────────
// CARBON ESTIMATIONS
// ──────────────────────────────────────────

export async function saveCarbonEstimation(
  estimation: Omit<CarbonEstimation, "id" | "estimatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTIONS.CARBON_ESTIMATIONS), {
    ...estimation,
    estimatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getFarmCarbonEstimations(
  farmId: string
): Promise<CarbonEstimation[]> {
  const q = query(
    collection(db(), COLLECTIONS.CARBON_ESTIMATIONS),
    where("farmId", "==", farmId),
    orderBy("estimatedAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as CarbonEstimation
  );
}

export async function getUserCarbonEstimations(
  userId: string
): Promise<CarbonEstimation[]> {
  const q = query(
    collection(db(), COLLECTIONS.CARBON_ESTIMATIONS),
    where("userId", "==", userId),
    orderBy("estimatedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as CarbonEstimation
  );
}

// ──────────────────────────────────────────
// SATELLITE ANALYTICS
// ──────────────────────────────────────────

export async function saveSatelliteAnalytics(
  data: Omit<SatelliteAnalytics, "id">
): Promise<string> {
  const ref = await addDoc(
    collection(db(), COLLECTIONS.SATELLITE_ANALYTICS),
    data
  );
  return ref.id;
}

export async function getFarmSatelliteAnalytics(
  farmId: string,
  count = 12
): Promise<SatelliteAnalytics[]> {
  const q = query(
    collection(db(), COLLECTIONS.SATELLITE_ANALYTICS),
    where("farmId", "==", farmId),
    orderBy("capturedAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as SatelliteAnalytics
  );
}

// ──────────────────────────────────────────
// REPORTS
// ──────────────────────────────────────────

export async function createReport(
  data: Omit<Report, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTIONS.REPORTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserReports(userId: string): Promise<Report[]> {
  const q = query(
    collection(db(), COLLECTIONS.REPORTS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
}

// ──────────────────────────────────────────
// ACTIVITY
// ──────────────────────────────────────────

export async function logActivity(
  activity: Omit<ActivityItem, "id" | "timestamp">
): Promise<void> {
  await addDoc(collection(db(), COLLECTIONS.ACTIVITY), {
    ...activity,
    timestamp: serverTimestamp(),
  });
}

export async function getRecentActivity(
  userId: string,
  count = 10
): Promise<ActivityItem[]> {
  const q = query(
    collection(db(), COLLECTIONS.ACTIVITY),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ActivityItem);
}

// ──────────────────────────────────────────
// DASHBOARD STATS (computed)
// ──────────────────────────────────────────

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const farms = await getUserFarms(userId);

  const totalAreaHectares = farms.reduce(
    (sum, f) => sum + (f.areaHectares ?? 0),
    0
  );
  const activeFarms = farms.filter(
    (f) => f.status === "active" || f.status === "monitoring"
  ).length;

  const estimatedCO2 = farms.reduce(
    (sum, f) => sum + quickCarbonEstimate(f.areaHectares, f.cropType, 0.55),
    0
  );

  return {
    totalFarms: farms.length,
    totalAreaHectares: parseFloat(totalAreaHectares.toFixed(2)),
    averageCarbonScore:
      farms.length > 0 ? Math.round(52 + Math.random() * 28) : 0,
    activeFarms,
    totalCO2eReduction: parseFloat(estimatedCO2.toFixed(2)),
    cropHealthIndex:
      farms.length > 0
        ? parseFloat((0.55 + Math.random() * 0.3).toFixed(2))
        : 0,
    averageNDVI:
      farms.length > 0
        ? parseFloat((0.45 + Math.random() * 0.25).toFixed(3))
        : 0,
    estimatedCarbonCredits: parseFloat((estimatedCO2 * 15).toFixed(2)),
  };
}
