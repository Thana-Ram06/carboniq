"use client";
import { useAuth } from "@/hooks/use-auth";
import { Key, Code } from "lucide-react";
import { APIKeyManager } from "@/components/api/APIKeyManager";

const ENDPOINT_DOCS = [
  {
    method: "GET",
    path: "/api/external/ndvi",
    description: "NDVI time series and current vegetation health for a farm",
    params: "farmId, cropType, irrigationType, state, area",
    scope: "read:ndvi",
  },
  {
    method: "GET",
    path: "/api/external/carbon",
    description: "Carbon sequestration score and CO₂ equivalent tonnes",
    params: "farmId, cropType, irrigationType, state, area",
    scope: "read:carbon",
  },
  {
    method: "GET",
    path: "/api/external/anomalies",
    description: "Anomaly detection results and drought risk assessment",
    params: "farmId, cropType, irrigationType, state, area",
    scope: "read:anomalies",
  },
  {
    method: "GET",
    path: "/api/regional/scan",
    description: "District or state-level aggregated intelligence report",
    params: "scope, region, state",
    scope: "read:benchmarks",
  },
  {
    method: "GET",
    path: "/api/forecast/drought",
    description: "Multi-horizon drought probability forecast",
    params: "region, state, ndvi (optional)",
    scope: "read:ndvi",
  },
  {
    method: "GET",
    path: "/api/forecast/seasonal",
    description: "Seasonal sowing calendar, crop recommendations, and yield outlook",
    params: "state",
    scope: "read:benchmarks",
  },
];

const RATE_LIMITS = [
  { tier: "Starter",      reqMin: 60,   dailyQuota: "1,000",   color: "text-slate-300 bg-slate-500/10 border-slate-500/20" },
  { tier: "Professional", reqMin: 300,  dailyQuota: "10,000",  color: "text-blue-300 bg-blue-500/10 border-blue-500/20" },
  { tier: "Enterprise",   reqMin: 1500, dailyQuota: "100,000", color: "text-purple-300 bg-purple-500/10 border-purple-500/20" },
];

export default function APIPortalPage() {
  const { user } = useAuth();
  const userId = user?.uid ?? "demo-user";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5">
          <Key className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">API Portal</h1>
          <p className="text-sm text-slate-400">Manage API keys and integrate VASUDHA data into your systems</p>
        </div>
      </div>

      {/* Rate Limit Tiers */}
      <div className="grid grid-cols-3 gap-3">
        {RATE_LIMITS.map((tier) => (
          <div key={tier.tier} className={`rounded-xl border p-4 ${tier.color}`}>
            <p className="text-sm font-semibold text-white mb-2">{tier.tier}</p>
            <p className="text-xs text-slate-400">Rate limit: <span className="text-white">{tier.reqMin}/min</span></p>
            <p className="text-xs text-slate-400">Daily quota: <span className="text-white">{tier.dailyQuota}</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Key Manager */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <APIKeyManager userId={userId} />
        </div>

        {/* Endpoint Documentation */}
        <div className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-400" />
            <p className="text-sm font-semibold text-white">API Endpoints</p>
          </div>
          <div className="divide-y divide-white/5">
            {ENDPOINT_DOCS.map((ep) => (
              <div key={ep.path} className="p-4 hover:bg-white/2">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded bg-green-500/15 border border-green-500/20 px-1.5 py-0.5 text-xs font-mono font-semibold text-green-300">
                    {ep.method}
                  </span>
                  <code className="text-xs text-blue-300 font-mono">{ep.path}</code>
                </div>
                <p className="text-xs text-slate-400 mb-1.5">{ep.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-500">Params: {ep.params}</span>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-blue-300">{ep.scope}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Example curl */}
          <div className="p-4 border-t border-white/5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Example Request</p>
            <div className="rounded-lg bg-slate-900/60 border border-white/5 p-3 overflow-x-auto">
              <pre className="text-xs text-emerald-300 font-mono whitespace-pre">{`curl https://carboniq-three.vercel.app/api/external/ndvi \\
  -H "Authorization: Bearer vsk_your_key_here" \\
  -d farmId=farm_123 \\
  -d cropType=rice \\
  -d state=Maharashtra \\
  -d area=5`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
