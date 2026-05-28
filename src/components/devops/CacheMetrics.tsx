"use client";
import { getCacheLayerStats } from "@/lib/devops/deployment-tracker";
import type { CacheLayerStats } from "@/types";

const LAYER_CONFIG: Record<CacheLayerStats["layer"], { label: string; color: string; bg: string; border: string }> = {
  memory:   { label: "In-Memory",  color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
  cdn:      { label: "CDN",        color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  regional: { label: "Regional",   color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  api:      { label: "API Cache",  color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
};

function formatKb(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function CacheMetrics() {
  const layers = getCacheLayerStats();
  const avgHitRate = layers.reduce((s, l) => s + l.hitRate, 0) / layers.length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-green-400">{avgHitRate.toFixed(1)}%</p>
          <p className="text-xs text-slate-400">Avg Hit Rate</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{layers.reduce((s, l) => s + l.keys, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Keys</p>
        </div>
      </div>

      <div className="space-y-2">
        {layers.map((l) => {
          const cfg = LAYER_CONFIG[l.layer];
          return (
            <div key={l.layer} className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                <span className="text-sm font-bold text-white">{l.hitRate.toFixed(1)}% hits</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${l.hitRate}%`, backgroundColor: "currentColor" }}
                />
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500">
                <span>{l.keys.toLocaleString()} keys</span>
                <span>{l.avgLatencyMs.toFixed(1)}ms avg</span>
                <span>{l.evictions} evictions</span>
                <span>{formatKb(l.sizeKb)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
