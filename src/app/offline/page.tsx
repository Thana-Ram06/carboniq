"use client";

import { WifiOff, RefreshCw, Leaf } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <WifiOff className="w-8 h-8 text-green-400/60" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 justify-center">
            <Leaf className="w-5 h-5 text-green-400" />
            VASUDHA
          </h1>
          <p className="text-lg font-semibold text-foreground mt-3">You are offline</p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            No internet connection detected. Evidence captured offline will sync automatically when you reconnect.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">आप ऑफलाइन हैं — पुनः कनेक्ट होने पर डेटा सिंक होगा।</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-green-500/30 bg-green-500/8 text-green-300 text-sm font-medium hover:bg-green-500/15 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <a
            href="/evidence"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border bg-muted text-foreground text-sm font-medium hover:border-green-500/20 transition-all active:scale-95"
          >
            View offline evidence queue
          </a>
        </div>
        <p className="text-[10px] text-muted-foreground/30 font-mono">
          VASUDHA Field Intelligence · Offline Mode
        </p>
      </div>
    </div>
  );
}
