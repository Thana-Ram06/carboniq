import { FileCheck, Shield, Download, BookOpen } from "lucide-react";
import { getComplianceSummary } from "@/lib/compliance/compliance-reporter";
import { ComplianceExportPanel } from "@/components/compliance/ComplianceExportPanel";

export default function CompliancePage() {
  const summary = getComplianceSummary();

  const standards = [
    { id: "ISO14064",     name: "ISO 14064-3",    status: "certified",    desc: "Third-party greenhouse gas verification and validation" },
    { id: "UNFCCC",       name: "UNFCCC CDM",     status: "compliant",    desc: "UN Framework Convention on Climate Change CDM methodology" },
    { id: "GoldStandard", name: "Gold Standard",  status: "compliant",    desc: "Premium carbon offset standard with sustainable development co-benefits" },
    { id: "VCS",          name: "Verra VCS",      status: "in_review",    desc: "Voluntary Carbon Standard — VM0042 Improved Agricultural Land Management" },
    { id: "IPCC",         name: "IPCC 2006",      status: "compliant",    desc: "IPCC Guidelines Vol. 4 — Agriculture, Forestry and Other Land Use" },
  ];

  const methodologyItems = [
    { title: "Carbon Stock Accounting",    desc: "Above-ground biomass calculated using allometric equations with crop-specific factors from ICAR national database" },
    { title: "Soil Organic Carbon",        desc: "SOC change estimated using RothC model with state-specific soil texture inputs from NBSS&LUP soil maps" },
    { title: "Emission Factor Application",desc: "IPCC 2006 Tier 2 emission factors applied for N₂O from nitrogen-fertilised soils and CH₄ from rice paddies" },
    { title: "Satellite Verification",     desc: "NDVI-based biomass proxy verified against Sentinel-2 Level-2A imagery at 10m resolution, cloud-masked with >90% clear pixel requirement" },
    { title: "Uncertainty Quantification", desc: "Monte Carlo uncertainty propagation with 95% confidence intervals; all reported values are conservative lower bounds" },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Advanced Compliance Reporting</h1>
        <p className="text-slate-400 mt-1 text-sm">Compliance-ready exports, audit reports, methodology documentation, and regulatory submission tools</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{summary.approvalRate}%</p>
          <p className="text-xs text-slate-400">Approval Rate</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{summary.approvedReports}</p>
          <p className="text-xs text-slate-400">Approved Reports</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{summary.standardsCovered}</p>
          <p className="text-xs text-slate-400">Standards Covered</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{(summary.totalCarbonTonnes / 1000).toFixed(0)}K</p>
          <p className="text-xs text-slate-400">tCO₂e Reported</p>
        </div>
      </div>

      {/* Compliance reports */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-semibold text-white">Compliance Reports</h2>
          <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
            <Download className="h-3.5 w-3.5" />Export All
          </span>
        </div>
        <ComplianceExportPanel />
      </div>

      {/* Standards coverage */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Regulatory Standards Coverage</h2>
        </div>
        <div className="space-y-2">
          {standards.map((s) => (
            <div key={s.id} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
              <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${s.status === "certified" ? "bg-green-400" : s.status === "compliant" ? "bg-blue-400" : "bg-yellow-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{s.name}</span>
                  <span className={`rounded-full border px-2 text-[10px] uppercase font-medium ${s.status === "certified" ? "text-green-400 border-green-500/30 bg-green-500/10" : s.status === "compliant" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"}`}>
                    {s.status === "in_review" ? "In Review" : s.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology appendix */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-purple-400" />
          <h2 className="text-base font-semibold text-white">Methodology Appendix</h2>
          <span className="ml-auto text-xs text-slate-500">v3.2 · 2025-03-01</span>
        </div>
        <div className="space-y-3">
          {methodologyItems.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-700 bg-slate-700/10 px-4 py-3">
              <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
