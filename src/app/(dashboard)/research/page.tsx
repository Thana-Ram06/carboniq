import { Database, Download, BookOpen, Globe } from "lucide-react";
import { getDatasetSummary } from "@/lib/research/dataset-manager";
import { DatasetManager } from "@/components/research/DatasetManager";

export default function ResearchPage() {
  const summary = getDatasetSummary();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Research Datasets</h1>
        <p className="text-slate-400 mt-1 text-sm">Validation datasets, anonymized exports, and open research repositories for scientific community use</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.researchDatasets}</p>
          <p className="text-xs text-slate-400">Research Datasets</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.publicDatasets}</p>
          <p className="text-xs text-slate-400">Public Datasets</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalDownloads.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Downloads</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.totalCitations}</p>
          <p className="text-xs text-slate-400">Citations</p>
        </div>
      </div>

      {/* Validation datasets */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white">Internal Validation Datasets</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.validationDatasets} datasets · {summary.totalRecords.toLocaleString()} total records</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
          {[
            { label: "Multi-Season Archive", rec: "8,640", pub: false },
            { label: "Kharif NDVI 2025", rec: "3,420", pub: true },
            { label: "Rabi Carbon Data", rec: "2,180", pub: true },
            { label: "Drought Events", rec: "580", pub: true },
          ].map((d) => (
            <div key={d.label} className="rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2">
              <p className="text-white font-medium text-[11px]">{d.label}</p>
              <p>{d.rec} records</p>
              <p className={d.pub ? "text-green-400" : "text-slate-500"}>{d.pub ? "Public" : "Internal"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Published datasets */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Published Research Datasets</h2>
        </div>
        <DatasetManager />
      </div>

      {/* Open science policy */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Open Science Policy</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { title: "CC-BY-4.0", desc: "Freely usable for any purpose including commercial research, with attribution to VASUDHA CarbonIQ" },
            { title: "CC-BY-NC-4.0", desc: "Free for non-commercial academic and research use; commercial use requires a separate data license agreement" },
            { title: "Anonymisation", desc: "All farmer personal data removed. Farm IDs replaced with pseudonymous identifiers. GPS coordinates aggregated to 1km grid" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3">
              <p className="font-semibold text-white mb-1">{item.title}</p>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Download className="h-3 w-3" />Download via API: <span className="font-mono text-blue-300">/api/research/datasets/:id</span></span>
        </div>
      </div>
    </div>
  );
}
