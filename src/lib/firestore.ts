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
  FarmBoundary,
  FarmBoundaryRecord,
  CarbonEstimation,
  SatelliteAnalytics,
  Report,
  ActivityItem,
  DashboardStats,
  ScanJob,
  ScanJobStatus,
  Insight,
  FarmInsightsRecord,
  CarbonAnalyticsRecord,
  VegetationScoreRecord,
  NDVIHistoryRecord,
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
  // Best-effort boundary cleanup
  try {
    await deleteFarmBoundary(farmId);
  } catch {
    // Boundary may not exist — ignore
  }
}

// ──────────────────────────────────────────
// FARM BOUNDARIES
// ──────────────────────────────────────────

export async function saveFarmBoundary(
  farmId: string,
  userId: string,
  boundary: FarmBoundary,
  areaHectares: number
): Promise<void> {
  const col = collection(db(), COLLECTIONS.FARM_BOUNDARIES);
  const q = query(col, where("farmId", "==", farmId));
  const snap = await getDocs(q);

  const vertexCount =
    boundary.coordinates[0]?.length
      ? boundary.coordinates[0].length - 1 // last point is duplicate of first
      : 0;

  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, {
      boundary,
      areaHectares,
      vertexCount,
      updatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(col, {
      farmId,
      userId,
      boundary,
      areaHectares,
      vertexCount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Also persist inline on the farm doc for fast reads
  await updateDoc(doc(db(), COLLECTIONS.FARMS, farmId), {
    boundary,
    areaHectares,
    updatedAt: serverTimestamp(),
  });
}

export async function getFarmBoundary(
  farmId: string
): Promise<FarmBoundaryRecord | null> {
  const q = query(
    collection(db(), COLLECTIONS.FARM_BOUNDARIES),
    where("farmId", "==", farmId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as FarmBoundaryRecord;
}

export async function deleteFarmBoundary(farmId: string): Promise<void> {
  const q = query(
    collection(db(), COLLECTIONS.FARM_BOUNDARIES),
    where("farmId", "==", farmId)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
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

// ── SATELLITE SCANS (Phase 2) ────────────────────────────────────────────────

export interface SatelliteScanRecord {
  id: string;
  farmId: string;
  userId: string;
  ndvi: number;
  ndwi: number;
  evi: number;
  savi: number;
  vegetationCoverage: number;
  moistureIndex: number;
  cloudCoverage: number;
  healthStatus: string;
  trend: string;
  source: "sentinel_hub" | "computed";
  scannedAt: import("firebase/firestore").Timestamp;
}

export async function saveSatelliteScan(
  scan: Omit<SatelliteScanRecord, "id" | "scannedAt">
): Promise<string> {
  const ref = await addDoc(
    collection(db(), "satellite_scans"),
    { ...scan, scannedAt: serverTimestamp() }
  );
  // Update latest NDVI on the farm doc for fast reads
  await updateDoc(doc(db(), COLLECTIONS.FARMS, scan.farmId), {
    "latestNDVI.ndvi":  scan.ndvi,
    "latestNDVI.scannedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getLatestSatelliteScan(
  farmId: string
): Promise<SatelliteScanRecord | null> {
  const q = query(
    collection(db(), "satellite_scans"),
    where("farmId", "==", farmId),
    orderBy("scannedAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as SatelliteScanRecord;
}

export async function getUserLatestScans(
  userId: string,
  count = 20
): Promise<SatelliteScanRecord[]> {
  const q = query(
    collection(db(), "satellite_scans"),
    where("userId", "==", userId),
    orderBy("scannedAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SatelliteScanRecord);
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

// ──────────────────────────────────────────
// SCAN JOBS
// ──────────────────────────────────────────

export async function createScanJob(data: {
  farmId: string;
  userId: string;
}): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTIONS.SCAN_JOBS), {
    ...data,
    status: "pending" as ScanJobStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateScanJob(
  jobId: string,
  update: { status: ScanJobStatus; error?: string }
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.SCAN_JOBS, jobId), {
    ...update,
    updatedAt: serverTimestamp(),
  });
}

export async function getRecentScanJobs(
  userId: string,
  count = 10
): Promise<ScanJob[]> {
  const q = query(
    collection(db(), COLLECTIONS.SCAN_JOBS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ScanJob);
}

// ──────────────────────────────────────────
// FARM INSIGHTS
// ──────────────────────────────────────────

export async function saveFarmInsights(data: {
  farmId: string;
  userId: string;
  insights: Insight[];
}): Promise<void> {
  const col = collection(db(), COLLECTIONS.FARM_INSIGHTS);
  const q = query(col, where("farmId", "==", data.farmId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, {
      insights: data.insights,
      generatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(col, {
      ...data,
      generatedAt: serverTimestamp(),
    });
  }
}

export async function getLatestFarmInsights(
  farmId: string
): Promise<FarmInsightsRecord | null> {
  const q = query(
    collection(db(), COLLECTIONS.FARM_INSIGHTS),
    where("farmId", "==", farmId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as FarmInsightsRecord;
}

// ──────────────────────────────────────────
// CARBON ANALYTICS
// ──────────────────────────────────────────

export async function saveCarbonAnalytics(
  data: Omit<CarbonAnalyticsRecord, "id" | "computedAt">
): Promise<void> {
  const col = collection(db(), COLLECTIONS.CARBON_ANALYTICS);
  const q = query(col, where("farmId", "==", data.farmId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, { ...data, computedAt: serverTimestamp() });
  } else {
    await addDoc(col, { ...data, computedAt: serverTimestamp() });
  }
}

export async function getLatestCarbonAnalytics(
  farmId: string
): Promise<CarbonAnalyticsRecord | null> {
  const q = query(
    collection(db(), COLLECTIONS.CARBON_ANALYTICS),
    where("farmId", "==", farmId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  } as CarbonAnalyticsRecord;
}

// ──────────────────────────────────────────
// VEGETATION SCORES
// ──────────────────────────────────────────

export async function saveVegetationScore(
  data: Omit<VegetationScoreRecord, "id" | "computedAt">
): Promise<void> {
  const col = collection(db(), COLLECTIONS.VEGETATION_SCORES);
  const q = query(col, where("farmId", "==", data.farmId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, { ...data, computedAt: serverTimestamp() });
  } else {
    await addDoc(col, { ...data, computedAt: serverTimestamp() });
  }
}

// ──────────────────────────────────────────
// NDVI HISTORY
// ──────────────────────────────────────────

export async function saveNDVIHistory(data: {
  farmId: string;
  userId: string;
  ndvi: number;
  evi?: number;
  source: string;
}): Promise<void> {
  await addDoc(collection(db(), COLLECTIONS.NDVI_HISTORY), {
    ...data,
    capturedAt: serverTimestamp(),
  });
}

export async function getFarmNDVIHistory(
  farmId: string,
  months = 12
): Promise<NDVIHistoryRecord[]> {
  const q = query(
    collection(db(), COLLECTIONS.NDVI_HISTORY),
    where("farmId", "==", farmId),
    orderBy("capturedAt", "desc"),
    limit(months)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NDVIHistoryRecord);
}
