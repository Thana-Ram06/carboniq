import Link from "next/link";
import { Leaf, MapPin, Calendar, ExternalLink } from "lucide-react";
import { getPublicFarmReport, getTierConfig } from "@/lib/public/farm-portal";
import { FarmBadge } from "@/components/public/FarmBadge";
import { PublicNDVICard } from "@/components/public/PublicNDVICard";

export default async function PublicFarmPage({
  params,
}: {
  params: Promise<{ farmId: string }>;
}) {
  const { farmId } = await params;
  const report = getPublicFarmReport(farmId);
  const tierCfg = getTierConfig(report.sustainabilityTier);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-400" />
            <span className="font-bold text-white">VASUDHA</span>
            <span className="text-slate-500 text-sm">CarbonIQ</span>
          </div>
          <span className="text-xs text-slate-500">Public Farm Intelligence Report</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Farm identity */}
        <div className={`rounded-2xl border ${tierCfg.border} ${tierCfg.bg} px-6 py-5`}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{report.farmName}</h1>
              <p className="text-sm text-slate-400 mt-0.5">{report.ownerName}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{report.district}, {report.state}</span>
                <span>{report.areaHectares.toFixed(1)} hectares</span>
                <span>{report.cropType}</span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs uppercase font-bold tracking-wide ${tierCfg.color}`}>{tierCfg.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">Farm ID: {report.farmId}</p>
            </div>
          </div>
        </div>

        {/* NDVI and badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PublicNDVICard
            ndviScore={report.ndviScore}
            ndviTrend={report.ndviTrend}
            carbonScoreTonnes={report.carbonScoreTonnes}
            cropType={report.cropType}
            areaHectares={report.areaHectares}
            lastUpdated={report.lastUpdated}
          />
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Certification</h2>
            <FarmBadge
              tier={report.sustainabilityTier}
              verificationStatus={report.verificationStatus}
              badges={report.badges}
              carbonCredits={report.carbonCredits}
              confidenceLevel={report.confidenceLevel}
            />
          </div>
        </div>

        {/* Methodology note */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4">
          <h2 className="text-sm font-semibold text-white mb-2">Methodology</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Carbon estimates computed using ISO 14064-3:2019 Tier 2 biomass accumulation methodology with IPCC 2006 emission factors.
            Vegetation health (NDVI) derived from ESA Sentinel-2 satellite imagery at 10m resolution.
            All calculations independently verified by VASUDHA audit network.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {["ISO 14064-3", "IPCC 2006", "Sentinel-2", "UNFCCC Compatible"].map((tag) => (
              <span key={tag} className="rounded-full border border-slate-600 bg-slate-700/40 px-2.5 py-1 text-xs text-slate-400">{tag}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Report generated {new Date(report.lastUpdated).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <Link href="/" className="flex items-center gap-1 hover:text-slate-400 transition-colors">
            <ExternalLink className="h-3 w-3" />
            VASUDHA Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
