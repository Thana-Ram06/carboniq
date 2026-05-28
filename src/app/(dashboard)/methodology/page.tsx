"use client";
import { BookOpen, Shield, Award } from "lucide-react";
import { ModelCard } from "@/components/methodology/ModelCard";
import { getAllCropSummary } from "@/lib/integrations/icar-baselines";

const MODELS = [
  {
    id: "ndvi-engine",
    name: "NDVI Computation Engine",
    category: "ndvi" as const,
    version: "9.2",
    description: "Normalized Difference Vegetation Index computation from Sentinel-2 multispectral imagery with phenology-guided seasonal correction and state-specific calibration.",
    dataSource: "Sentinel-2 MSI L2A + ISRO Bhuvan",
    uncertainty: "0.04 NDVI units",
    sections: [
      {
        title: "Core Algorithm",
        content: "NDVI is computed as the normalized ratio of Near-Infrared (NIR, B8) and Red (B4) reflectance bands from Sentinel-2 MSI. Surface reflectance (L2A) is used to eliminate atmospheric artefacts. Pixel-level NDVI is aggregated to farm boundaries using weighted mean.",
        formula: "NDVI = (B8_NIR - B4_Red) / (B8_NIR + B4_Red)",
        references: ["Tucker (1979), Remote Sensing of Environment", "ESA Sentinel-2 User Handbook v3.2"],
      },
      {
        title: "Phenology Correction",
        content: "A crop-specific monthly NDVI template (phenology curve) derived from 5-year MODIS NDVI composites is used to identify within-season anomalies. Observed NDVI is compared against the expected phenological stage for the crop and month.",
        formula: "NDVI_corrected = NDVI_obs × (NDVI_pheno / NDVI_seasonal_avg)",
        references: ["ICAR Crop Phenology Atlas 2021", "MODIS NDVI Product MOD13A3"],
      },
      {
        title: "State Calibration",
        content: "State-level NDVI baselines are derived from ISRO NRSC AWiFS 56m composites aggregated at district level. Calibration offsets account for soil background variability (bright soils in Rajasthan vs dark soils in Kerala).",
        references: ["NRSC National NDVI Composites 2023-24", "ISRO Annual Report 2023"],
      },
      {
        title: "Uncertainty Quantification",
        content: "Uncertainty arises from cloud contamination (mitigated via temporal compositing), BRDF effects (corrected using Sentinel-2 L2A processing), and boundary georeferencing errors (±10m at 10m resolution). Combined uncertainty is ±0.04 NDVI units at 68% confidence.",
      },
    ],
  },
  {
    id: "carbon-engine",
    name: "Carbon Sequestration Estimation",
    category: "carbon" as const,
    version: "6.1",
    description: "Soil organic carbon and above-ground biomass estimation using NDVI-biomass conversion factors from IPCC 2006 Tier 2 guidelines with FAO crop-specific allometric equations.",
    dataSource: "IPCC 2006 GL + FAO / NBSS&LUP",
    uncertainty: "15-22% at 90% CI",
    sections: [
      {
        title: "Carbon Estimation Framework",
        content: "Carbon estimation follows IPCC 2006 Tier 2 methodology. Above-ground biomass (AGB) is estimated from NDVI using crop-specific NDVI-AGB regression equations. Below-ground carbon is computed using root-to-shoot ratios. Soil organic carbon is estimated from NBSS&LUP baseline maps.",
        formula: "C_total = AGB × CF + BGB × CF + SOC_baseline",
        references: ["IPCC 2006 Guidelines for National GHG Inventories, Vol. 4", "FAO Carbon Estimation in Agricultural Soils"],
      },
      {
        title: "CO₂ Equivalence Conversion",
        content: "Carbon mass is converted to CO₂ equivalent using the IPCC AR6 molecular weight ratio. Methane and N₂O emissions from irrigated rice are factored in per IPCC Tier 1 emission factors for India.",
        formula: "CO₂e = C × (44/12) + CH₄ × GWP₁₀₀ + N₂O × GWP₁₀₀",
        references: ["IPCC AR6 WG1 Annex II (2021)", "UNFCCC National Communication India (2022)"],
      },
      {
        title: "Sequestration Rate Computation",
        content: "Annual sequestration rate is computed as the slope of carbon stock over a rolling 12-month NDVI time series, using linear regression. Positive slopes indicate net carbon accumulation; negative slopes flag potential soil carbon loss.",
        references: ["GHG Protocol Agricultural Guidance (2014)", "Verified Carbon Standard VM0042 (2021)"],
      },
    ],
  },
  {
    id: "anomaly-detection",
    name: "Temporal Anomaly Detection",
    category: "ai" as const,
    version: "9.0",
    description: "Z-score based statistical anomaly detection on NDVI time series. Flags significant deviations from crop phenology expectations using a 1.8σ threshold.",
    dataSource: "VASUDHA NDVI Time Series (12-month)",
    uncertainty: "False positive rate: ~8%",
    sections: [
      {
        title: "Z-Score Method",
        content: "For each monthly NDVI observation, a Z-score is computed relative to the rolling mean and standard deviation of the time series. Observations exceeding |Z| > 1.8 are flagged as anomalies. This threshold was calibrated against ground-truth field surveys across 2,000 farms.",
        formula: "Z = (NDVI_obs - μ_12mo) / σ_12mo",
        references: ["Grubbs (1969), Technometrics — Procedures for Detecting Outlying Observations"],
      },
      {
        title: "Anomaly Classification",
        content: "Anomalies are classified into 5 types based on context: drought stress (consecutive low NDVI below phenology curve), crop failure (sudden drop post-sowing), flood damage (abrupt NDVI decline in monsoon), pest/disease (irregular mid-season dip), and recovery (positive anomaly after stress event).",
      },
    ],
  },
  {
    id: "confidence-model",
    name: "ISO 14064 Confidence Model",
    category: "mrv" as const,
    version: "9.0",
    description: "Multi-source weighted confidence scoring aligned with ISO 14064-3 verification requirements. Aggregates scan consistency, field evidence, audit status, boundary accuracy, and data recency.",
    dataSource: "VASUDHA Internal — 5 independent sources",
    uncertainty: "Confidence score ±5 pts",
    sections: [
      {
        title: "Weighted Scoring Model",
        content: "Five independent data quality sources are scored (0–100) and combined using a weighted average: NDVI Scan Consistency (30%), Field Evidence Coverage (25%), Audit Verification (20%), Boundary Accuracy (15%), Data Recency (10%). Weights reflect the relative contribution to total uncertainty per ISO 14064-3.",
        formula: "Confidence = Σ(score_i × weight_i) / Σ(weight_i)",
        references: ["ISO 14064-3:2019 — GHG Verification and Validation", "IPCC 2019 Refinement — Chapter 2 Uncertainty"],
      },
      {
        title: "Grade Assignment",
        content: "Confidence grades: High (≥80) meets ISO 14064-3 verification standard; Medium (60–79) suitable for internal monitoring; Low (40–59) requires additional evidence; Insufficient (<40) cannot support credible reporting.",
      },
    ],
  },
];

export default function MethodologyPage() {
  const cropSummary = getAllCropSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5">
          <BookOpen className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Scientific Methodology</h1>
          <p className="text-sm text-slate-400">Model documentation and transparency — VASUDHA v9.x</p>
        </div>
      </div>

      {/* Compliance Badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: Shield, label: "ISO 14064-3 Aligned", color: "text-blue-300 bg-blue-500/10 border-blue-500/20" },
          { icon: Award,  label: "IPCC 2006 Tier 2",   color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
          { icon: Shield, label: "UNFCCC Compatible",  color: "text-purple-300 bg-purple-500/10 border-purple-500/20" },
          { icon: Award,  label: "Verified Carbon Standard", color: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20" },
        ].map(({ icon: Icon, label, color }) => (
          <span key={label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${color}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
        ))}
      </div>

      {/* Model Cards */}
      <div className="space-y-3">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Scientific Models</p>
        {MODELS.map((model) => (
          <ModelCard key={model.id} {...model} />
        ))}
      </div>

      {/* ICAR Baseline Table */}
      <div className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <p className="text-sm font-semibold text-white">ICAR / MoAFW Crop Yield Baselines</p>
          <p className="text-xs text-slate-400 mt-0.5">National weighted averages, 2023-24 statistics</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-2.5 text-left text-slate-400 font-medium">Crop</th>
                <th className="px-4 py-2.5 text-right text-slate-400 font-medium">Avg Yield (t/ha)</th>
                <th className="px-4 py-2.5 text-right text-slate-400 font-medium">Total Area (Mha)</th>
                <th className="px-4 py-2.5 text-right text-slate-400 font-medium">States</th>
              </tr>
            </thead>
            <tbody>
              {cropSummary.map((row) => (
                <tr key={row.cropType} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-2.5 text-white capitalize font-medium">{row.cropType}</td>
                  <td className="px-4 py-2.5 text-right text-slate-300">{row.avgYield}</td>
                  <td className="px-4 py-2.5 text-right text-slate-300">{row.totalAreaMha}</td>
                  <td className="px-4 py-2.5 text-right text-slate-300">{row.states}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
