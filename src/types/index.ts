import type { User } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

// ──────────────────────────────────────────
// AUTH TYPES
// ──────────────────────────────────────────

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp | null;
  role: "admin" | "analyst" | "viewer";
  organization?: string;
  onboardingComplete: boolean;
}

export type FirebaseUser = User;

// ──────────────────────────────────────────
// FARM TYPES
// ──────────────────────────────────────────

export type CropType =
  | "rice"
  | "wheat"
  | "sugarcane"
  | "cotton"
  | "maize"
  | "soybean"
  | "groundnut"
  | "sunflower"
  | "mustard"
  | "other";

export type IrrigationType =
  | "drip"
  | "sprinkler"
  | "flood"
  | "rainfed"
  | "canal"
  | "borewell";

export type FarmStatus = "active" | "inactive" | "monitoring" | "verified";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface FarmBoundary {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][];
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  location: string;
  state: string;
  district: string;
  cropType: CropType;
  areaHectares: number;
  irrigationType: IrrigationType;
  soilType?: string;
  coordinates: GeoPoint;
  boundary?: FarmBoundary;
  status: FarmStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateFarmInput {
  name: string;
  location: string;
  state: string;
  district: string;
  cropType: CropType;
  areaHectares: number;
  irrigationType: IrrigationType;
  soilType?: string;
  coordinates: GeoPoint;
  boundary?: FarmBoundary;
  notes?: string;
}

// ──────────────────────────────────────────
// CARBON ESTIMATION TYPES
// ──────────────────────────────────────────

export interface CarbonEstimation {
  id: string;
  farmId: string;
  userId: string;
  estimatedAt: Timestamp;
  inputs: CarbonEstimationInputs;
  results: CarbonEstimationResults;
  methodology: "ipcc_tier1" | "ipcc_tier2" | "custom_india";
  status: "draft" | "final" | "verified";
}

export interface CarbonEstimationInputs {
  cropType: CropType;
  areaHectares: number;
  irrigationType: IrrigationType;
  ndviScore: number;
  vegetationCoverage: number;
  soilOrganicCarbon?: number;
  fertilizerUseKgPerHa?: number;
  seasonalCycles: number;
}

export interface CarbonEstimationResults {
  totalCO2eReduction: number;
  carbonScore: number;
  sustainabilityIndex: number;
  estimatedBiomass: number;
  soilCarbonSequestration: number;
  emissionReductionFactor: number;
  projectedAnnualCredits: number;
  confidence: "low" | "medium" | "high";
  breakdown: CarbonBreakdown;
}

export interface CarbonBreakdown {
  biomassCarbon: number;
  soilCarbon: number;
  reducedEmissions: number;
  waterConservation: number;
}

// ──────────────────────────────────────────
// SATELLITE / NDVI TYPES
// ──────────────────────────────────────────

export type NDVIStatus =
  | "sparse"
  | "moderate"
  | "healthy"
  | "very_healthy"
  | "dense";

export interface SatelliteAnalytics {
  id: string;
  farmId: string;
  capturedAt: Timestamp;
  ndviMean: number;
  ndviMin: number;
  ndviMax: number;
  ndviStatus: NDVIStatus;
  vegetationCoverage: number;
  moistureIndex: number;
  soilExposure: number;
  cloudCoverage: number;
  imagerySource: "sentinel2" | "landsat8" | "landsat9" | "modis" | "mock";
  thumbnailUrl?: string;
}

export interface NDVITimeSeries {
  date: string;
  ndvi: number;
  status: NDVIStatus;
}

export interface VegetationAnalytics {
  farmId: string;
  timeSeries: NDVITimeSeries[];
  currentNDVI: number;
  trend: "increasing" | "decreasing" | "stable";
  healthStatus: NDVIStatus;
}

// ──────────────────────────────────────────
// REPORT TYPES
// ──────────────────────────────────────────

export type ReportType = "farm" | "carbon" | "satellite" | "sustainability";
export type ReportStatus = "generating" | "ready" | "error";

export interface Report {
  id: string;
  userId: string;
  farmId?: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  period: {
    from: Timestamp;
    to: Timestamp;
  };
  summary: string;
  data: Record<string, unknown>;
  createdAt: Timestamp;
  downloadUrl?: string;
}

// ──────────────────────────────────────────
// DASHBOARD TYPES
// ──────────────────────────────────────────

export interface DashboardStats {
  totalFarms: number;
  totalAreaHectares: number;
  averageCarbonScore: number;
  activeFarms: number;
  totalCO2eReduction: number;
  cropHealthIndex: number;
  averageNDVI: number;
  estimatedCarbonCredits: number;
}

export interface ActivityItem {
  id: string;
  type:
    | "farm_added"
    | "analysis_complete"
    | "report_generated"
    | "ndvi_update"
    | "carbon_estimated";
  title: string;
  description: string;
  timestamp: Timestamp;
  farmId?: string;
  farmName?: string;
  metadata?: Record<string, unknown>;
}

// ──────────────────────────────────────────
// UI TYPES
// ──────────────────────────────────────────

export type Theme = "dark" | "light" | "system";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export type IndianState =
  | "Andhra Pradesh"
  | "Bihar"
  | "Chhattisgarh"
  | "Gujarat"
  | "Haryana"
  | "Karnataka"
  | "Kerala"
  | "Madhya Pradesh"
  | "Maharashtra"
  | "Odisha"
  | "Punjab"
  | "Rajasthan"
  | "Tamil Nadu"
  | "Telangana"
  | "Uttar Pradesh"
  | "West Bengal"
  | "Other";
