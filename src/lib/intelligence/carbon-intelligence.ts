import type { Farm } from "@/types";

export interface CarbonIntelligence {
  carbonScoreTonnes: number;
  biomassGreenTonnes: number;
  sustainabilityIndex: number;
  vegetationCoverage: number;
  carbonCreditEstimate: number;
  methodology: string;
  confidence: "low" | "medium" | "high";
}

// Dry biomass yield factors (t/ha at NDVI saturation ≈ 0.85)
const BIOMASS_FACTOR: Record<string, number> = {
  sugarcane: 28,
  cotton: 6,
  rice: 8,
  maize: 9,
  wheat: 7,
  soybean: 5,
  groundnut: 5,
  mustard: 5,
  sunflower: 6,
  other: 6,
};

// Carbon fraction of dry biomass (IPCC 2006 defaults)
const CARBON_COEFF: Record<string, number> = {
  sugarcane: 0.43,
  cotton: 0.43,
  rice: 0.42,
  maize: 0.45,
  wheat: 0.44,
  soybean: 0.42,
  groundnut: 0.41,
  mustard: 0.43,
  sunflower: 0.43,
  other: 0.43,
};

export function computeCarbonIntelligence(
  farm: Farm,
  ndvi: number
): CarbonIntelligence {
  const cropKey =
    Object.keys(BIOMASS_FACTOR).find((k) =>
      farm.cropType.toLowerCase().includes(k)
    ) ?? "other";

  const biomassFactor = BIOMASS_FACTOR[cropKey];
  const carbonCoeff = CARBON_COEFF[cropKey] ?? 0.43;

  // Vegetation coverage from NDVI (Beer-Lambert approximation, clamped)
  const vegetationCoverage = parseFloat(
    Math.min(100, Math.max(0, (ndvi / 0.85) * 100)).toFixed(1)
  );

  // Normalised NDVI fraction above baseline (0.10 = bare soil)
  const ndviFraction = Math.max(0, (ndvi - 0.1) / 0.75);

  // Green biomass estimate: NDVI-scaled × crop peak yield × area
  const biomassGreenTonnes = parseFloat(
    (biomassFactor * ndviFraction * farm.areaHectares).toFixed(2)
  );

  // Carbon = biomass × dry-matter fraction (0.45) × carbon coefficient × CO2/C ratio (44/12)
  const carbonScoreTonnes = parseFloat(
    (biomassGreenTonnes * 0.45 * carbonCoeff * (44 / 12)).toFixed(2)
  );

  // Sustainability index: NDVI contribution + irrigation bonus + area efficiency
  const ndviScore = Math.min(60, (ndvi / 0.85) * 60);
  const irrigationBonus: Record<string, number> = {
    drip: 20,
    sprinkler: 15,
    canal: 10,
    borewell: 8,
    rainfed: 5,
    flood: 5,
  };
  const irrigBonus = irrigationBonus[farm.irrigationType] ?? 5;
  const areaBonus = Math.min(20, (farm.areaHectares / 10) * 4);
  const sustainabilityIndex = Math.min(
    100,
    Math.round(ndviScore + irrigBonus + areaBonus)
  );

  // Carbon credit at USD 15 / tCO₂e
  const carbonCreditEstimate = parseFloat((carbonScoreTonnes * 15).toFixed(2));

  const confidence =
    ndvi > 0.4 ? "high" : ndvi > 0.2 ? "medium" : "low";

  return {
    carbonScoreTonnes,
    biomassGreenTonnes,
    sustainabilityIndex,
    vegetationCoverage,
    carbonCreditEstimate,
    methodology:
      "VASUDHA v1: NDVI-derived biomass × IPCC carbon coefficient (Beer-Lambert LAI)",
    confidence,
  };
}
