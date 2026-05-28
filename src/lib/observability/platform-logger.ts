"use server";

import {
  collection, addDoc, query, where, orderBy, limit, getDocs,
  serverTimestamp, updateDoc, doc,
} from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import type { PlatformLog, PlatformLogLevel, PlatformLogCategory } from "@/types";

function db() { return getFirebaseDb(); }

export async function writePlatformLog(input: {
  level: PlatformLogLevel;
  category: PlatformLogCategory;
  message: string;
  userId?: string;
  farmId?: string;
  orgId?: string;
  metadata?: Record<string, string | number | boolean>;
}): Promise<void> {
  try {
    await addDoc(collection(db(), COLLECTIONS.PLATFORM_LOGS), {
      ...input,
      resolved: false,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Never throw from logging — silently absorb to avoid cascading failures
  }
}

export async function getRecentPlatformLogs(opts: {
  level?: PlatformLogLevel;
  category?: PlatformLogCategory;
  count?: number;
  unresolvedOnly?: boolean;
}): Promise<PlatformLog[]> {
  const constraints: Parameters<typeof query>[1][] = [
    orderBy("createdAt", "desc"),
    limit(opts.count ?? 50),
  ];
  if (opts.level) constraints.unshift(where("level", "==", opts.level));
  if (opts.category) constraints.unshift(where("category", "==", opts.category));
  if (opts.unresolvedOnly) constraints.unshift(where("resolved", "==", false));

  const q = query(collection(db(), COLLECTIONS.PLATFORM_LOGS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PlatformLog);
}

export async function resolveLog(logId: string): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.PLATFORM_LOGS, logId), { resolved: true });
}

export async function getErrorCount24h(): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const q = query(
    collection(db(), COLLECTIONS.PLATFORM_LOGS),
    where("level", "in", ["error", "critical"]),
    where("createdAt", ">=", since),
    limit(500)
  );
  const snap = await getDocs(q);
  return snap.size;
}
