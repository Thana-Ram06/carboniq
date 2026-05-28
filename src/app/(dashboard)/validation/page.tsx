import { FlaskConical, Target, BarChart3 } from "lucide-react";
import { getValidationSummary } from "@/lib/validation/ground-truth";
import { getAccuracySummary } from "@/lib/validation/model-accuracy";
import { GroundTruthUpload } from "@/components/validation/GroundTruthUpload";
import { ModelAccuracyDashboard } from "@/components/validation/ModelAccuracyDashboard";
import { ConfidenceTrendChart } from "@/components/validation/ConfidenceTrendChart";
import { ValidationWorkflow } from "@/components/field/ValidationWorkflow";

export default function ValidationPage() {
  const summary = getValidationSummary();
  const accuracy = getAccuracySummary();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Scientific Validation</h1>
        <p className="text-slate-400 mt-1 text-sm">Ground-truth field observations, model accuracy benchmarks, and forecast confidence metrics</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.totalObservations.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Observations</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.validationRate}%</p>
          <p className="text-xs text-slate-400">Validated</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{accuracy.avgNDVIR2}</p>
          <p className="text-xs text-slate-400">Avg NDVI R²</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{accuracy.avgCarbonR2}</p>
          <p className="text-xs text-slate-400">Avg Carbon R²</p>
        </div>
      </div>

      {/* Ground truth missions */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Field Verification Missions</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.activeMissions} active</span>
        </div>
        <GroundTruthUpload />
      </div>

      {/* Model accuracy */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Model Accuracy Benchmarks</h2>
          <span className="ml-auto text-xs text-slate-500">{accuracy.passingModels}/{accuracy.totalModels} passing</span>
        </div>
        <ModelAccuracyDashboard />
      </div>

      {/* Validation workflow & confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="h-5 w-5 text-purple-400" />
            <h2 className="text-base font-semibold text-white">Latest Observations</h2>
          </div>
          <ValidationWorkflow />
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-yellow-400" />
            <h2 className="text-base font-semibold text-white">Forecast Confidence</h2>
          </div>
          <ConfidenceTrendChart />
        </div>
      </div>

      {/* Methodology */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <h2 className="text-sm font-semibold text-white mb-2">Validation Methodology</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ground-truth observations follow ISO 14064-3:2019 Tier 2 field measurement protocol. NDVI accuracy assessed using paired
          Sentinel-2 satellite estimates against handheld spectroradiometer readings. Carbon validation uses destructive biomass
          sampling at 30cm depth with IPCC 2006 allometric equations. Model evaluation uses held-out test sets never seen during
          training, evaluated quarterly using MAE, RMSE, and R² metrics.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {["ISO 14064-3", "IPCC 2006", "MAE/RMSE/R²", "Out-of-sample testing", "Quarterly benchmarking"].map((tag) => (
            <span key={tag} className="rounded-full border border-slate-600 bg-slate-700/40 px-2.5 py-1 text-xs text-slate-400">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
