import { Activity, AlertCircle, CheckCircle, BarChart3, XCircle, Minus } from "lucide-react";
import { getInfrastructureStatus } from "@/lib/pipeline/pipeline-engine";
import { computeReliabilityScore } from "@/lib/observability/incident-tracker";
import { IncidentLog } from "@/components/observability/IncidentLog";
import { UptimeChart } from "@/components/observability/UptimeChart";

const COMPONENT_LABELS: Record<string, string> = {
  firestore: "Firestore",
  storage: "Storage",
  auth: "Auth",
  satellite: "Satellite",
  externalAPIs: "External APIs",
  pipeline: "Pipeline",
};

function ComponentStatusIcon({ status }: { status: "up" | "degraded" | "down" }) {
  if (status === "up") return <CheckCircle className="h-4 w-4 text-green-400" />;
  if (status === "degraded") return <AlertCircle className="h-4 w-4 text-yellow-400" />;
  return <XCircle className="h-4 w-4 text-red-400" />;
}

export default function StatusPage() {
  const infra = getInfrastructureStatus();
  const reliability = computeReliabilityScore();

  const STATUS_STYLE: Record<string, string> = {
    operational: "text-green-400 border-green-500/20 bg-green-500/10",
    degraded: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
    incident: "text-red-400 border-red-500/20 bg-red-500/10",
  };
  const STATUS_LABEL: Record<string, string> = {
    operational: "All Systems Operational",
    degraded: "Degraded",
    incident: "Incident in Progress",
  };

  const heroStyle = STATUS_STYLE[infra.overallStatus] ?? STATUS_STYLE.operational;
  const statusLabel = STATUS_LABEL[infra.overallStatus] ?? STATUS_LABEL.operational;

  const reliabilityComponents = [
    { label: "Availability",    value: reliability.components.availability },
    { label: "Latency",         value: reliability.components.latency },
    { label: "Error Rate",      value: reliability.components.errorRate },
    { label: "Security",        value: reliability.components.security },
    { label: "Data Integrity",  value: reliability.components.dataIntegrity },
  ];

  const componentEntries = Object.entries(infra.components) as [string, "up" | "degraded" | "down"][];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Infrastructure Status</h1>
        <p className="text-slate-400 mt-1 text-sm">Real-time platform health, uptime, and reliability scores</p>
      </div>

      {/* Hero reliability score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-2xl border px-6 py-5 ${heroStyle}`}>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8" />
            <div>
              <p className="text-3xl font-bold">{reliability.overall}</p>
              <p className="text-sm font-medium opacity-80">Reliability Score</p>
            </div>
          </div>
          <p className="text-xs mt-3 opacity-70">{statusLabel} · SLA {reliability.slaCompliancePct}%</p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-700/20 px-6 py-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">30-day Uptime</p>
          <p className="text-3xl font-bold text-white">{infra.uptimePct30d}%</p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <Minus className="h-3 w-3 text-slate-400" />
            <span className="text-slate-400 capitalize">{reliability.trend} trend</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-700/20 px-6 py-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Component Scores</p>
          <div className="grid grid-cols-5 gap-2">
            {reliabilityComponents.map((c) => (
              <div key={c.label} className="text-center">
                <p className={`text-base font-bold ${c.value >= 90 ? "text-green-400" : c.value >= 80 ? "text-yellow-400" : "text-red-400"}`}>
                  {c.value}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure components grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Infrastructure Components</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {componentEntries.map(([key, status]) => (
            <div key={key} className={`rounded-xl border p-4 ${status === "up" ? "border-green-500/20 bg-green-500/5" : status === "degraded" ? "border-yellow-500/20 bg-yellow-500/5" : "border-red-500/20 bg-red-500/5"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{COMPONENT_LABELS[key] ?? key}</span>
                <ComponentStatusIcon status={status} />
              </div>
              <p className={`text-xs mt-1 capitalize ${status === "up" ? "text-green-400" : status === "degraded" ? "text-yellow-400" : "text-red-400"}`}>
                {status === "up" ? "Operational" : status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Uptime chart and incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">30-Day Uptime History</h2>
          </div>
          <UptimeChart />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-semibold text-white">Incident Log</h2>
          </div>
          <IncidentLog />
        </div>
      </div>
    </div>
  );
}
