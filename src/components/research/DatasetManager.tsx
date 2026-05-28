import { Database, Download, BookOpen } from "lucide-react";
import { getResearchDatasets } from "@/lib/research/dataset-manager";

const LICENSE_STYLE: Record<string, string> = {
  "CC-BY-4.0": "text-green-400 bg-green-500/10 border-green-500/20",
  "CC-BY-NC-4.0": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "proprietary": "text-slate-400 bg-slate-700/30 border-slate-600",
};

const TYPE_LABEL: Record<string, string> = {
  ndvi_timeseries: "NDVI Series",
  carbon_samples: "Carbon Samples",
  soil_profiles: "Soil Profiles",
  biomass_survey: "Biomass Survey",
  drone_imagery: "Drone Imagery",
};

export function DatasetManager() {
  const datasets = getResearchDatasets();

  return (
    <div className="space-y-3">
      {datasets.map((d) => (
        <div key={d.id} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">{d.title}</p>
                <p className="text-[10px] text-slate-500">{TYPE_LABEL[d.dataType] ?? d.dataType} · {d.recordCount.toLocaleString()} records</p>
              </div>
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono ${LICENSE_STYLE[d.license] ?? LICENSE_STYLE.proprietary}`}>{d.license}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-500 mb-2">
            <span>Coverage: {d.spatialCoverage}</span>
            <span>Period: {d.temporalRange}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex gap-3 text-slate-500">
              <span className="flex items-center gap-1"><Download className="h-2.5 w-2.5" />{d.downloadCount}</span>
              <span className="flex items-center gap-1"><BookOpen className="h-2.5 w-2.5" />{d.citationCount} citations</span>
            </div>
            {d.isPublished ? (
              <span className="text-green-400">Published</span>
            ) : (
              <span className="text-slate-500">Internal</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
