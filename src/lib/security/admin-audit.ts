"use server";

import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import type { AdminActivity } from "@/types";

function db() { return getFirebaseDb(); }

export async function logAdminActivity(input: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: AdminActivity["targetType"];
  targetId?: string;
  details: string;
}): Promise<void> {
  await addDoc(collection(db(), COLLECTIONS.ADMIN_ACTIVITY), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function getAdminActivity(count = 50): Promise<AdminActivity[]> {
  const q = query(
    collection(db(), COLLECTIONS.ADMIN_ACTIVITY),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AdminActivity);
}
