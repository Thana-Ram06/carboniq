import { Webhook, CheckCircle2, XCircle, Activity } from "lucide-react";
import { getWebhookConfigs, getExportConnectors, getWebhookEventSummary } from "@/lib/interop/webhook-manager";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function WebhookManager() {
  const webhooks = getWebhookConfigs();
  const connectors = getExportConnectors();
  const summary = getWebhookEventSummary();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{summary.activeWebhooks}</p>
          <p className="text-xs text-slate-400">Active</p>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-center">
          <p className="text-lg font-bold text-green-400">{summary.successRate}%</p>
          <p className="text-xs text-slate-400">Success</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{summary.totalDeliveries.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Deliveries</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 px-3 py-2 text-center">
          <p className="text-lg font-bold text-white">{summary.eventTypes}</p>
          <p className="text-xs text-slate-400">Event Types</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Registered Webhooks</p>
        <div className="space-y-2">
          {webhooks.map((w) => (
            <div key={w.id} className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2.5">
              <Webhook className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{w.url}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                  <span>{w.events.length} events</span>
                  <span className="flex items-center gap-1"><Activity className="h-2.5 w-2.5" />{w.successCount} ok / {w.failureCount} fail</span>
                  {w.lastTriggered && <span>{formatRelative(w.lastTriggered)}</span>}
                </div>
              </div>
              {w.active
                ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              }
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Export Connectors</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {connectors.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2">
              <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase font-bold ${
                c.type === "pdf" ? "bg-red-500/20 text-red-300"
                : c.type === "geojson" ? "bg-green-500/20 text-green-300"
                : c.type === "shapefile" ? "bg-purple-500/20 text-purple-300"
                : "bg-blue-500/20 text-blue-300"
              }`}>{c.type}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{c.name}</p>
                <p className="text-[10px] text-slate-500">{c.recordCount.toLocaleString()} records</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
