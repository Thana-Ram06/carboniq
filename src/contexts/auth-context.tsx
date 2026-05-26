"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "firebase/auth";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
  onAuthChange,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleError = (err: unknown) => {
    const e = err as { code?: string; message?: string };
    const code = e.code ?? "";
    const messages: Record<string, string> = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/popup-closed-by-user": "Sign-in popup was closed.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
    };
    setError(messages[code] ?? e.message ?? "An error occurred.");
  };

  const handleSignInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      handleError(err);
    }
  }, []);

  const handleSignInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        await signInWithEmail(email, password);
      } catch (err) {
        handleError(err);
      }
    },
    []
  );

  const handleSignUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      setError(null);
      try {
        await signUpWithEmail(email, password, displayName);
      } catch (err) {
        handleError(err);
      }
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    setError(null);
    await signOut();
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
