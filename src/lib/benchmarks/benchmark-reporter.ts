import type { BenchmarkReport, ValidationScoreGrade } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const GRADE_MAP: Record<string, ValidationScoreGrade> = {
  "0": "A", "1": "A", "2": "B", "3": "B", "4": "C", "5": "C", "6": "D", "7": "F",
};

function pctToGrade(pct: number): ValidationScoreGrade {
  if (pct >= 95) return GRADE_MAP["0"];
  if (pct >= 90) return GRADE_MAP["2"];
  if (pct >= 85) return GRADE_MAP["3"];
  if (pct >= 75) return GRADE_MAP["4"];
  if (pct >= 65) return GRADE_MAP["6"];
  return GRADE_MAP["7"];
}

export function getBenchmarkReports(): BenchmarkReport[] {
  const reports = [
    {
      id: "bench-2025-kharif",
      title: "Kharif 2025 National Accuracy Benchmark",
      date: "2025-11-30",
      states: 9, districts: 42, obs: 3420, improvement: 4.2,
      findings: [
        "NDVI MAE improved by 12% over Kharif 2024 baseline",
        "Carbon model showing systematic positive bias in rain-fed areas",
        "Drought forecaster skill score degraded at 90-day horizon",
      ],
      recommendations: [
        "Re-calibrate carbon model with expanded rain-fed training data",
        "Incorporate soil moisture index for drought at >60-day horizons",
        "Increase ground-truth sampling in semi-arid zones",
      ],
    },
    {
      id: "bench-2025-rabi",
      title: "Rabi 2025–26 Regional Validation Report",
      date: "2026-02-28",
      states: 7, districts: 31, obs: 2180, improvement: 2.8,
      findings: [
        "Punjab wheat NDVI accuracy best-in-class at R² = 0.96",
        "Telangana rice crop stage misclassification rate: 8.3%",
        "MP soybean carbon estimates within 5% of field measurements",
      ],
      recommendations: [
        "Deploy phenology-aware NDVI model for rice in Telangana",
        "Expand auditor training for soybean field measurement protocol",
      ],
    },
    {
      id: "bench-2025-annual",
      title: "Annual Accuracy & Calibration Report 2025",
      date: "2026-01-15",
      states: 12, districts: 68, obs: 8640, improvement: 6.1,
      findings: [
        "Platform-wide NDVI accuracy: MAE 0.041, RMSE 0.058",
        "Carbon sequestration model R² = 0.913 across all crop types",
        "Anomaly detection false positive rate reduced to 4.2%",
        "Regional calibration improved accuracy in 8 of 9 target states",
      ],
      recommendations: [
        "Publish validation dataset as open research resource under CC-BY-4.0",
        "Submit methodology paper to Nature Food or similar peer-review venue",
        "Establish quarterly benchmark reporting cycle",
      ],
    },
  ];

  return reports.map((r) => {
    const seed = seedHash(r.id);
    const ndviPct = parseFloat(sf(seed, 88, 97).toFixed(1));
    const carbonPct = parseFloat(sf(seed + 1, 85, 95).toFixed(1));
    const overall = parseFloat(((ndviPct + carbonPct) / 2).toFixed(1));
    return {
      id: r.id,
      title: r.title,
      reportDate: r.date,
      coverageStates: r.states,
      coverageDistricts: r.districts,
      totalObservations: r.obs,
      ndviAccuracyGrade: pctToGrade(ndviPct),
      carbonAccuracyGrade: pctToGrade(carbonPct),
      overallAccuracyPct: overall,
      improvementFromPrior: r.improvement,
      findings: r.findings,
      recommendations: r.recommendations,
    };
  });
}

export function getBenchmarkSummary() {
  const reports = getBenchmarkReports();
  const latest = reports[reports.length - 1];
  return {
    totalReports: reports.length,
    latestReportDate: latest?.reportDate ?? "N/A",
    latestOverallAccuracy: latest?.overallAccuracyPct ?? 0,
    latestNDVIGrade: latest?.ndviAccuracyGrade ?? "C",
    latestCarbonGrade: latest?.carbonAccuracyGrade ?? "C",
    totalObservationsAcrossReports: reports.reduce((a, r) => a + r.totalObservations, 0),
  };
}
