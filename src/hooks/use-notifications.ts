"use client";

import { useEffect, useState, useCallback } from "react";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import {
  collection, query, where, orderBy, limit, onSnapshot,
} from "firebase/firestore";
import type { AppNotification } from "@/types";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications/notification-service";

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      where("deleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setNotifications(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification))
        );
        setLoading(false);
      },
      () => {
        // If index doesn't exist yet, fall back to basic query
        const fallbackQ = query(
          collection(db, COLLECTIONS.NOTIFICATIONS),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(30)
        );
        return onSnapshot(fallbackQ, (snap) => {
          setNotifications(
            snap.docs
              .map((d) => ({ id: d.id, ...d.data() } as AppNotification))
              .filter((n) => !(n as { deleted?: boolean }).deleted)
          );
          setLoading(false);
        }, () => setLoading(false));
      }
    );
    return unsub;
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
  }, [userId]);

  return { notifications, loading, unreadCount, markRead, markAllRead };
}
