import { Settings2, MapPin, Leaf } from "lucide-react";
import { getCalibrationSummary } from "@/lib/calibration/calibration-engine";
import { getCalibrationCoverage } from "@/lib/calibration/regional-calibration";
import { CalibrationPanel } from "@/components/calibration/CalibrationPanel";
import { RegionalCalibrationDashboard } from "@/components/calibration/RegionalCalibrationDashboard";

export default function CalibrationPage() {
  const summary = getCalibrationSummary();
  const coverage = getCalibrationCoverage();

  const STATUS_STYLE: Record<string, string> = {
    optimal: "text-green-400 border-green-500/20 bg-green-500/10",
    needs_review: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Calibration Engine</h1>
        <p className="text-slate-400 mt-1 text-sm">Model coefficient tuning, regional bias corrections, and seasonal adjustment factors</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`rounded-xl border px-4 py-3 ${STATUS_STYLE[summary.calibrationStatus] ?? STATUS_STYLE.optimal}`}>
          <p className="text-2xl font-bold">{summary.deviatedFromDefault}</p>
          <p className="text-xs text-slate-400">Deviated Params</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.avgDeviation}%</p>
          <p className="text-xs text-slate-400">Avg Deviation</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{coverage.approvedZones}/{coverage.totalZones}</p>
          <p className="text-xs text-slate-400">Approved Zones</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{coverage.avgR2}</p>
          <p className="text-xs text-slate-400">Avg R² (Regional)</p>
        </div>
      </div>

      {/* Calibration schedule */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Calibration Schedule</p>
            <p className="text-xs text-slate-400 mt-0.5">Full system calibration runs quarterly with seasonal ground-truth data</p>
          </div>
          <div className="text-right text-xs">
            <p className="text-slate-400">Last calibration: <span className="text-white">{summary.lastFullCalibration}</span></p>
            <p className="text-slate-400">Next scheduled: <span className="text-yellow-300">{summary.nextScheduledCalibration}</span></p>
          </div>
        </div>
      </div>

      {/* Coefficient panel */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Model Coefficients</h2>
          <span className="ml-auto text-xs text-slate-500">{summary.totalCoefficients} parameters</span>
        </div>
        <CalibrationPanel />
      </div>

      {/* Regional calibrations */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Regional Calibrations</h2>
          <span className="ml-auto text-xs text-slate-500">{coverage.statesCovered} states · {coverage.totalZones} zones</span>
        </div>
        <RegionalCalibrationDashboard />
      </div>

      {/* Seasonal corrections */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="h-5 w-5 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Seasonal Correction Protocol</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { season: "Kharif (Jun–Oct)", note: "High NDVI variability; biomass accumulation corrected for monsoonal soil reflectance interference" },
            { season: "Rabi (Nov–Mar)", note: "Lower base NDVI; wheat and mustard carbon fractions adjusted with wintertime allometric coefficients" },
            { season: "Zaid (Apr–May)", note: "Short-cycle crops; rapid phenological change requires 8-day temporal smoothing window instead of 16-day" },
          ].map((item) => (
            <div key={item.season} className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3">
              <p className="font-semibold text-white mb-1">{item.season}</p>
              <p className="text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
