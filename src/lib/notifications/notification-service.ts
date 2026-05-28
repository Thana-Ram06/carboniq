import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import {
  collection, addDoc, serverTimestamp,
  query, where, getDocs, updateDoc, doc, writeBatch,
} from "firebase/firestore";
import type { NotificationType } from "@/types";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  farmId?: string;
  farmName?: string;
  actionUrl?: string;
  severity?: "info" | "warning" | "critical";
}

export async function createNotification(input: CreateNotificationInput): Promise<string> {
  try {
    const db = getFirebaseDb();
    const ref = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...input,
      read: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch {
    return "";
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
  } catch {}
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch {}
}

export async function deleteNotification(id: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { deleted: true });
  } catch {}
}
