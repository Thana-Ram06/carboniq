"use client";
import { CheckCircle, AlertTriangle, XCircle, Satellite, Database, Cloud, Globe } from "lucide-react";
import { getDataSourceSummaries } from "@/lib/integrations/copernicus";
import type { CopernicusProduct } from "@/types";

const PRODUCT_ICONS: Record<CopernicusProduct, React.ElementType> = {
  S2_MSI: Satellite,
  S1_SAR: Globe,
  S3_OLCI: Cloud,
  S5P_TROPOMI: Database,
};

const STATUS_ICON = {
  nominal: CheckCircle,
  delayed: AlertTriangle,
  outage: XCircle,
};

const STATUS_COLOR = {
  nominal: "text-green-400",
  delayed: "text-yellow-400",
  outage: "text-red-400",
};

const STATUS_BG = {
  nominal: "bg-green-500/10 border-green-500/20",
  delayed: "bg-yellow-500/10 border-yellow-500/20",
  outage: "bg-red-500/10 border-red-500/20",
};

interface Props { state: string }

export function DataSourceStatus({ state }: Props) {
  const summaries = getDataSourceSummaries(state);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {summaries.map((src) => {
        const Icon = PRODUCT_ICONS[src.product];
        const StatusIcon = STATUS_ICON[src.status];
        return (
          <div key={src.product} className={`rounded-xl border p-4 ${STATUS_BG[src.status]}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-white/5 p-2">
                <Icon className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate">{src.name}</p>
                  <StatusIcon className={`h-4 w-4 shrink-0 ${STATUS_COLOR[src.status]}`} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Last scene: {src.lastScene}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Scenes</p>
                    <p className="text-white font-medium">{src.scenesAvailable}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Cloud</p>
                    <p className="text-white font-medium">{src.avgCloudCoverPct}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Coverage</p>
                    <p className="text-white font-medium">{src.coverageCompletePct}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
