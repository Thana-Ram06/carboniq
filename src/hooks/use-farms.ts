"use client";

import { useState, useEffect, useCallback } from "react";
import type { Farm, CreateFarmInput } from "@/types";
import {
  getUserFarms,
  createFarm,
  updateFarm,
  deleteFarm,
} from "@/lib/firestore";

export function useFarms(userId: string | null) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFarms = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserFarms(userId);
      setFarms(data);
    } catch (err) {
      setError("Failed to load farms.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const addFarm = useCallback(
    async (input: CreateFarmInput): Promise<string | null> => {
      if (!userId) return null;
      try {
        const id = await createFarm(userId, input);
        await fetchFarms();
        return id;
      } catch (err) {
        setError("Failed to create farm.");
        console.error(err);
        return null;
      }
    },
    [userId, fetchFarms]
  );

  const editFarm = useCallback(
    async (farmId: string, data: Partial<Farm>): Promise<void> => {
      try {
        await updateFarm(farmId, data);
        await fetchFarms();
      } catch (err) {
        setError("Failed to update farm.");
        console.error(err);
      }
    },
    [fetchFarms]
  );

  const removeFarm = useCallback(
    async (farmId: string): Promise<void> => {
      try {
        await deleteFarm(farmId);
        setFarms((prev) => prev.filter((f) => f.id !== farmId));
      } catch (err) {
        setError("Failed to delete farm.");
        console.error(err);
      }
    },
    []
  );

  return {
    farms,
    loading,
    error,
    refetch: fetchFarms,
    addFarm,
    editFarm,
    removeFarm,
  };
}
