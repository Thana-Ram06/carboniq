import type { Farm, PilotOrganization, FieldCampaign, DataQualityScore } from "@/types";
import { computeFarmNDVI } from "@/lib/satellite/ndvi-engine";
import { computeCarbonIntelligence } from "@/lib/intelligence/carbon-intelligence";

export interface DistrictExportRow {
  farmId: string;
  farmName: string;
  farmerName: string;
  state: string;
  district: string;
  areaHa: number;
  cropType: string;
  ndvi: number;
  carbonTonnes: number;
  qualityGrade: string;
  status: string;
}

export interface ExportBundle {
  generatedAt: string;
  totalFarms: number;
  totalAreaHa: number;
  totalCarbonTonnes: number;
  farms: DistrictExportRow[];
  pilots?: PilotOrganization[];
  campaigns?: FieldCampaign[];
  qualityScores?: DataQualityScore[];
}

export function buildDistrictExport(
  farms: Farm[],
  qualityMap?: Map<string, DataQualityScore>
): ExportBundle {
  const rows: DistrictExportRow[] = farms.map((farm) => {
    const ndviResult = computeFarmNDVI({
      farmId: farm.id,
      cropType: farm.cropType,
      irrigationType: farm.irrigationType,
      state: farm.state,
      areaHectares: farm.areaHectares,
    });
    const ndvi = ndviResult.current.ndvi;
    const carbon = computeCarbonIntelligence(farm, ndvi);
    const quality = qualityMap?.get(farm.id);
    return {
      farmId: farm.id,
      farmName: farm.name,
      farmerName: farm.farmerName ?? "—",
      state: farm.state ?? "Unknown",
      district: (farm as Farm & { district?: string }).district ?? "Unknown",
      areaHa: farm.areaHectares,
      cropType: farm.cropType,
      ndvi: parseFloat(ndvi.toFixed(4)),
      carbonTonnes: parseFloat(carbon.carbonScoreTonnes.toFixed(2)),
      qualityGrade: quality?.grade ?? "N/A",
      status: farm.status,
    };
  });

  const totalAreaHa = farms.reduce((s, f) => s + f.areaHectares, 0);
  const totalCarbonTonnes = rows.reduce((s, r) => s + r.carbonTonnes, 0);

  return {
    generatedAt: new Date().toISOString(),
    totalFarms: farms.length,
    totalAreaHa: parseFloat(totalAreaHa.toFixed(2)),
    totalCarbonTonnes: parseFloat(totalCarbonTonnes.toFixed(2)),
    farms: rows,
  };
}

export function exportToCSV(bundle: ExportBundle): string {
  const headers = [
    "Farm ID", "Farm Name", "Farmer Name", "State", "District",
    "Area (ha)", "Crop Type", "NDVI", "Carbon (tCO2e)", "Quality Grade", "Status",
  ];
  const rows = bundle.farms.map((r) =>
    [
      r.farmId, r.farmName, r.farmerName, r.state, r.district,
      r.areaHa, r.cropType, r.ndvi, r.carbonTonnes, r.qualityGrade, r.status,
    ]
      .map(String)
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
