"use client";
import { useState } from "react";
import { Key, Plus, Copy, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getSampleAPIKeys, getAPIUsageSummary, ALL_SCOPES } from "@/lib/api-keys/key-manager";
import type { APIKey } from "@/types";

const STATUS_CONFIG = {
  active:    { icon: CheckCircle, color: "text-green-400", label: "Active" },
  suspended: { icon: AlertCircle, color: "text-yellow-400", label: "Suspended" },
  revoked:   { icon: XCircle,     color: "text-red-400",   label: "Revoked" },
  expired:   { icon: XCircle,     color: "text-slate-400", label: "Expired" },
};

interface Props { userId: string }

export function APIKeyManager({ userId }: Props) {
  const [keys] = useState<APIKey[]>(() => getSampleAPIKeys(userId));
  const [usage] = useState(() => getAPIUsageSummary(userId));
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Usage Summary */}
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">API Usage This Month</p>
        <div className="grid grid-cols-2 gap-2">
          {usage.map((u) => (
            <div key={u.endpoint} className="rounded-lg border border-white/5 bg-white/3 p-3">
              <p className="text-xs text-slate-400 truncate">{u.endpoint}</p>
              <p className="text-lg font-semibold text-white mt-0.5">{u.callsThisMonth.toLocaleString()}</p>
              <p className="text-xs text-slate-500">calls · {u.avgResponseMs}ms avg · {u.errorRate}% err</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keys List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">API Keys</p>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Key
          </button>
        </div>

        {showCreate && (
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm font-medium text-emerald-300 mb-3">Create API Key</p>
            <div className="space-y-3">
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Key name (e.g. Research Pipeline)"
              />
              <div>
                <p className="text-xs text-slate-400 mb-2">Scopes</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SCOPES.filter((s) => s !== "admin").map((scope) => (
                    <label key={scope} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input type="checkbox" className="accent-emerald-500" defaultChecked={scope.startsWith("read:")} />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-sm font-medium text-white transition-colors"
              >
                Generate Key
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {keys.map((key) => {
            const cfg = STATUS_CONFIG[key.status];
            const Icon = cfg.icon;
            const isRevealed = revealed === key.id;
            return (
              <div key={key.id} className="rounded-xl border border-white/5 bg-white/3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{key.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon className={`h-3 w-3 ${cfg.color}`} />
                        <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{key.totalCalls.toLocaleString()} calls</p>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                  <code className="flex-1 text-xs text-slate-300 font-mono truncate">
                    {isRevealed ? key.keyPreview : "•".repeat(20) + key.keyPreview.slice(-8)}
                  </code>
                  <button onClick={() => setRevealed(isRevealed ? null : key.id)} className="text-slate-400 hover:text-white transition-colors">
                    {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => copyToClipboard(key.keyPreview, key.id)} className="text-slate-400 hover:text-white transition-colors">
                    {copied === key.id
                      ? <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                      : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {key.scopes.map((scope) => (
                    <span key={scope} className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                      {scope}
                    </span>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Last used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                  {" · "}{key.rateLimit} req/min · {key.dailyQuota.toLocaleString()} req/day
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
