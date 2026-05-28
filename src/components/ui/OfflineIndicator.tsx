"use client";

import { WifiOff, RefreshCw, CloudUpload } from "lucide-react";
import { useOffline } from "@/hooks/use-offline";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const { user } = useAuth();
  const { isOnline, pendingCount } = useOffline(user?.uid);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-xs font-medium border-b border-border",
        isOnline
          ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-400"
          : "bg-red-500/5 border-red-500/20 text-red-400"
      )}
    >
      {isOnline ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin flex-shrink-0" />
          <span>Syncing {pendingCount} offline upload{pendingCount !== 1 ? "s" : ""}…</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 flex-shrink-0" />
          <span>
            Offline mode — evidence saves locally
            {pendingCount > 0 && ` · ${pendingCount} pending`}
          </span>
          <CloudUpload className="w-3 h-3 ml-auto flex-shrink-0" />
        </>
      )}
    </div>
  );
}
