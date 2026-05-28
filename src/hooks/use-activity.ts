"use client";

import { useEffect, useState } from "react";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import {
  collection, query, where, orderBy, limit, onSnapshot,
} from "firebase/firestore";
import type { ActivityEvent } from "@/types";

export function useActivity(userId: string | null, maxItems = 20) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTIONS.ACTIVITY_EVENTS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxItems)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityEvent)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [userId, maxItems]);

  return { events, loading };
}
