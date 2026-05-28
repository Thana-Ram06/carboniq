"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              // New SW installed — notify UI if needed
              window.dispatchEvent(new CustomEvent("vasudha:sw-update"));
            }
          });
        });

        // Listen for sync trigger from SW
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "SYNC_PENDING_UPLOADS") {
            window.dispatchEvent(new CustomEvent("vasudha:sync-uploads"));
          }
        });
      } catch {
        // SW registration failed silently — app still works
      }
    };

    // Register after initial load to not block render
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
