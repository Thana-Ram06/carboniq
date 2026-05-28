"use client";

import { useEffect, useState, useCallback } from "react";
import { getPendingCount } from "@/lib/offline/offline-queue";

export function useOffline(userId?: string | null) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refreshPendingCount = useCallback(async () => {
    if (!userId) return;
    const count = await getPendingCount(userId);
    setPendingCount(count);
  }, [userId]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Refresh pending count when coming back online
  useEffect(() => {
    if (isOnline) refreshPendingCount();
  }, [isOnline, refreshPendingCount]);

  // Listen for sync events from service worker
  useEffect(() => {
    const handler = () => refreshPendingCount();
    window.addEventListener("vasudha:sync-uploads", handler);
    return () => window.removeEventListener("vasudha:sync-uploads", handler);
  }, [refreshPendingCount]);

  return { isOnline, pendingCount, refreshPendingCount };
}
