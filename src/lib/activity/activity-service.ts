import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { ActivityEventType } from "@/types";

export interface LogActivityInput {
  userId: string;
  type: ActivityEventType;
  title: string;
  description: string;
  farmId?: string;
  farmName?: string;
  metadata?: Record<string, string | number | boolean>;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const db = getFirebaseDb();
    await addDoc(collection(db, COLLECTIONS.ACTIVITY_EVENTS), {
      ...input,
      createdAt: serverTimestamp(),
    });
  } catch {}
}
