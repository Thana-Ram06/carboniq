import { Network, Webhook, Zap } from "lucide-react";
import { getWebhookEventSummary } from "@/lib/interop/webhook-manager";
import { WebhookManager } from "@/components/interop/WebhookManager";

export default function InteropPage() {
  const summary = getWebhookEventSummary();

  const partnerAPIs = [
    { name: "NDVI Query API",         endpoint: "/api/external/ndvi",          method: "GET",  desc: "Retrieve NDVI and vegetation health for a farm" },
    { name: "Carbon Estimation API",  endpoint: "/api/external/carbon",        method: "GET",  desc: "Get carbon sequestration estimates with confidence" },
    { name: "Anomaly Detection API",  endpoint: "/api/external/anomalies",     method: "GET",  desc: "Fetch satellite-detected anomaly events" },
    { name: "Drought Forecast API",   endpoint: "/api/forecast/drought",       method: "GET",  desc: "Multi-horizon drought probability forecasts" },
    { name: "Regional Scan API",      endpoint: "/api/regional/scan",          method: "GET",  desc: "District/state-level scan results" },
    { name: "Compliance Export API",  endpoint: "/api/compliance/export",      method: "GET",  desc: "ISO 14064/UNFCCC report exports" },
    { name: "Partner Onboarding API", endpoint: "/api/onboarding/partner",     method: "POST", desc: "Register new partner organisations" },
    { name: "Webhook Management API", endpoint: "/api/webhooks/manage",        method: "POST", desc: "Register webhooks for event delivery" },
    { name: "Public Farm API",        endpoint: "/api/public/farm/:farmId",    method: "GET",  desc: "Public farm report — no auth required" },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Interoperability Layer</h1>
        <p className="text-slate-400 mt-1 text-sm">External integrations, partner APIs, webhook delivery, and export connectors for ecosystem data federation</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.activeWebhooks}</p>
          <p className="text-xs text-slate-400">Active Webhooks</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.successRate}%</p>
          <p className="text-xs text-slate-400">Delivery Rate</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalDeliveries.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Event Deliveries</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{partnerAPIs.length}</p>
          <p className="text-xs text-slate-400">API Endpoints</p>
        </div>
      </div>

      {/* Webhook manager */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Webhook className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Webhook & Export Layer</h2>
        </div>
        <WebhookManager />
      </div>

      {/* Partner API catalogue */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Network className="h-5 w-5 text-purple-400" />
          <h2 className="text-base font-semibold text-white">Partner API Catalogue</h2>
        </div>
        <div className="space-y-2">
          {partnerAPIs.map((api) => (
            <div key={api.endpoint} className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2.5">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase w-10 text-center shrink-0 ${api.method === "POST" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"}`}>
                {api.method}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">{api.name}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{api.endpoint}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{api.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture note */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Data Federation Architecture</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { title: "Pull Model",    desc: "REST APIs with API key auth for on-demand data access by partner systems" },
            { title: "Push Model",    desc: "Webhook delivery for real-time event notifications to partner endpoints" },
            { title: "Bulk Export",   desc: "CSV/GeoJSON/Shapefile connectors for batch data exchange and GIS integration" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3">
              <p className="font-semibold text-white mb-1">{item.title}</p>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
