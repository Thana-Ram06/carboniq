"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserRole } from "@/types";
import { useAuth } from "@/hooks/use-auth";

interface RoleContextValue {
  role: UserRole;
  loading: boolean;
  refreshRole: () => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: "farmer",
  loading: true,
  refreshRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>("farmer");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) {
      setRole("farmer");
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    getDoc(doc(db, COLLECTIONS.USERS, user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setRole((data?.role as UserRole) ?? "farmer");
        } else {
          setDoc(
            doc(db, COLLECTIONS.USERS, user.uid),
            {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: "farmer",
              createdAt: serverTimestamp(),
              onboardingComplete: false,
            },
            { merge: true }
          );
          setRole("farmer");
        }
      })
      .catch(() => setRole("farmer"))
      .finally(() => setLoading(false));
  }, [user, tick]);

  const refreshRole = () => setTick((t) => t + 1);

  return (
    <RoleContext.Provider value={{ role, loading, refreshRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
