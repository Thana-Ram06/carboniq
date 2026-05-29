import type { User } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

// ──────────────────────────────────────────
// AUTH TYPES
// ──────────────────────────────────────────

export type UserRole = "farmer" | "auditor" | "org_manager" | "admin";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp | null;
  role: UserRole;
  orgId?: string;
  onboardingComplete: boolean;
}

export type NotificationType =
  | "scan_complete"
  | "scan_failed"
  | "audit_update"
  | "evidence_validated"
  | "risk_alert"
  | "report_ready"
  | "org_invite"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  farmId?: string;
  farmName?: string;
  actionUrl?: string;
  severity?: "info" | "warning" | "critical";
  createdAt: Timestamp;
}

export type ActivityEventType =
  | "farm_added"
  | "farm_updated"
  | "ndvi_update"
  | "carbon_estimated"
  | "analysis_complete"
  | "report_generated"
  | "evidence_uploaded"
  | "audit_submitted"
  | "risk_alert"
  | "scan_triggered";

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityEventType;
  title: string;
  description: string;
  farmId?: string;
  farmName?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: Timestamp;
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

export type SoilType =
  | "alluvial"
  | "black"
  | "red"
  | "laterite"
  | "desert"
  | "mountain"
  | "other";

export interface Farm {
  id: string;
  userId: string;
  name: string;
  farmerName?: string;
  location: string;
  state: string;
  district: string;
  village?: string;
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
  farmerName?: string;
  location: string;
  state: string;
  district: string;
  village?: string;
  cropType: CropType;
  areaHectares: number;
  irrigationType: IrrigationType;
  soilType?: string;
  coordinates: GeoPoint;
  boundary?: FarmBoundary;
  notes?: string;
}

export interface FarmBoundaryRecord {
  id: string;
  farmId: string;
  userId: string;
  boundary: FarmBoundary;
  areaHectares: number;
  vertexCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

// ──────────────────────────────────────────
// INTELLIGENCE TYPES (Phase 3)
// ──────────────────────────────────────────

export type ScanJobStatus = "pending" | "processing" | "completed" | "failed";

export interface ScanJob {
  id: string;
  farmId: string;
  userId: string;
  status: ScanJobStatus;
  error?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type InsightType =
  | "vegetation"
  | "irrigation"
  | "carbon"
  | "seasonal"
  | "trend"
  | "boundary";
export type InsightSeverity = "info" | "warning" | "success" | "critical";

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  body: string;
  metric?: string;
  timestamp: string;
}

export interface FarmInsightsRecord {
  id: string;
  farmId: string;
  userId: string;
  insights: Insight[];
  generatedAt: Timestamp;
}

export interface CarbonAnalyticsRecord {
  id: string;
  farmId: string;
  userId: string;
  carbonScoreTonnes: number;
  biomassGreenTonnes: number;
  sustainabilityIndex: number;
  vegetationCoverage: number;
  carbonCreditEstimate: number;
  methodology: string;
  confidence: "low" | "medium" | "high";
  computedAt: Timestamp;
}

export interface VegetationScoreRecord {
  id: string;
  farmId: string;
  userId: string;
  score: number;
  label: string;
  color: string;
  hex: string;
  description: string;
  computedAt: Timestamp;
}

export interface NDVIHistoryRecord {
  id: string;
  farmId: string;
  userId: string;
  ndvi: number;
  evi?: number;
  source: string;
  capturedAt: Timestamp;
}

// ──────────────────────────────────────────
// MONITORING TYPES (Phase 4)
// ──────────────────────────────────────────

export type ScanInterval = "daily" | "weekly" | "monthly";

export interface MonitoringConfig {
  interval: ScanInterval;
  autoEnabled: boolean;
  lastScanAt?: string;
  nextScanAt?: string;
}

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskAlertType =
  | "drought"
  | "heat_stress"
  | "vegetation_decline"
  | "irrigation_stress"
  | "anomaly"
  | "seasonal_lag";

export interface RiskAlert {
  id: string;
  type: RiskAlertType;
  severity: RiskSeverity;
  title: string;
  description: string;
  metric?: string;
  generatedAt: string;
}

export interface RiskAssessmentRecord {
  id: string;
  farmId: string;
  userId: string;
  overallRisk: number;
  severity: RiskSeverity;
  droughtRisk: number;
  vegetationDeclineRisk: number;
  heatStressRisk: number;
  irrigationStressRisk: number;
  alerts: RiskAlert[];
  confidence: "low" | "medium" | "high";
  computedAt: Timestamp;
}

export interface WeatherAnalyticsRecord {
  id: string;
  farmId: string;
  userId: string;
  rainfall7d: number;
  avgMaxTemp: number;
  avgMinTemp: number;
  avgET0: number;
  moistureDeficit: number;
  droughtScore: number;
  heatStressScore: number;
  forecastRain3d: number;
  fetchedAt: Timestamp;
}

export interface MonitoringJobRecord {
  id: string;
  farmId: string;
  userId: string;
  status: "queued" | "processing" | "completed" | "failed" | "retrying";
  priority: "low" | "normal" | "high";
  retryCount: number;
  maxRetries: number;
  error?: string;
  triggeredBy: "auto" | "manual" | "cron";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FarmTimelineEvent {
  id: string;
  farmId: string;
  userId: string;
  type: "scan" | "insight" | "alert" | "weather" | "system";
  title: string;
  description: string;
  severity?: RiskSeverity;
  metadata?: Record<string, string | number>;
  timestamp: Timestamp;
}

// ──────────────────────────────────────────
// VERIFICATION TYPES (Phase 5)
// ──────────────────────────────────────────

export type EvidenceType = "photo" | "field_note" | "measurement" | "document" | "gps_track";
export type EvidenceStatus = "pending" | "validated" | "rejected" | "flagged";
export type GpsValidationStatus = "valid" | "outside_boundary" | "invalid_coordinates" | "no_boundary";

export interface GpsCoordinate {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface FarmEvidence {
  id: string;
  farmId: string;
  userId: string;
  type: EvidenceType;
  status: EvidenceStatus;
  title: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  fileSizeBytes?: number;
  thumbnailUrl?: string;
  gpsCoordinate?: GpsCoordinate;
  gpsValidation: GpsValidationStatus;
  distanceFromBoundary?: number;
  fieldNotes?: string;
  tags?: string[];
  capturedAt: string;
  uploadedAt: Timestamp;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type AuditStatus = "pending" | "in_review" | "approved" | "rejected" | "requires_recheck";

export interface AuditReview {
  id: string;
  farmId: string;
  userId: string;
  auditorId: string;
  auditorName?: string;
  status: AuditStatus;
  periodStart: string;
  periodEnd: string;
  carbonScoreTonnes?: number;
  ndviAverage?: number;
  evidenceCount: number;
  validatedEvidenceCount: number;
  comments: string;
  checklistItems: AuditChecklistItem[];
  confidence: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AuditChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  notes?: string;
}

export type OrgRole = "owner" | "admin" | "auditor" | "viewer";

export interface OrgMember {
  userId: string;
  email: string;
  name?: string;
  role: OrgRole;
  joinedAt: Timestamp;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: OrgMember[];
  farmIds: string[];
  plan: "starter" | "professional" | "enterprise";
  createdAt: Timestamp;
}

export type ReportFormat = "mrv" | "carbon_summary" | "audit_export" | "executive";

export interface MonitoringReport {
  id: string;
  farmId: string;
  userId: string;
  orgId?: string;
  format: ReportFormat;
  status: ReportStatus;
  title: string;
  periodStart: string;
  periodEnd: string;
  ndviAverage?: number;
  carbonScoreTonnes?: number;
  confidenceScore?: number;
  auditStatus?: AuditStatus;
  evidenceCount?: number;
  summary: string;
  generatedAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface VerificationLog {
  id: string;
  farmId: string;
  userId: string;
  action: "upload" | "validate" | "audit_submit" | "audit_approve" | "audit_reject" | "report_generate" | "scan";
  actorId: string;
  actorName?: string;
  details: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: Timestamp;
}

export interface ConfidenceScore {
  overall: number;
  label: "Insufficient" | "Low" | "Medium" | "High" | "Verified";
  ndviScore: number;
  evidenceScore: number;
  auditScore: number;
  consistencyScore: number;
  breakdown: {
    scansCompleted: number;
    evidenceValidated: number;
    auditApproved: boolean;
    riskPenalty: number;
  };
}

// ──────────────────────────────────────────
// PHASE 8 — SCALABILITY & OBSERVABILITY
// ──────────────────────────────────────────

export type PlatformLogLevel = "info" | "warn" | "error" | "critical";
export type PlatformLogCategory =
  | "scan" | "evidence" | "audit" | "sync" | "auth" | "api" | "system" | "quality";

export interface PlatformLog {
  id: string;
  level: PlatformLogLevel;
  category: PlatformLogCategory;
  message: string;
  userId?: string;
  farmId?: string;
  orgId?: string;
  metadata?: Record<string, string | number | boolean>;
  resolved?: boolean;
  createdAt: Timestamp;
}

export type PilotStatus = "onboarding" | "active" | "suspended" | "completed";

export interface PilotOrganization {
  id: string;
  name: string;
  district: string;
  state: string;
  region: string;
  contactName: string;
  contactEmail: string;
  farmCount: number;
  farmerCount: number;
  status: PilotStatus;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: Timestamp;
}

export type CampaignStatus = "planned" | "active" | "completed" | "cancelled";

export interface FieldCampaign {
  id: string;
  orgId: string;
  name: string;
  district: string;
  state: string;
  targetFarms: number;
  completedFarms: number;
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  fieldAgentId: string;
  createdAt: Timestamp;
}

export type DataQualityGrade = "A" | "B" | "C" | "D" | "F";

export interface DataQualityScore {
  id: string;
  farmId: string;
  userId: string;
  overallScore: number;
  ndviConsistency: number;
  evidenceCompleteness: number;
  boundaryAccuracy: number;
  auditCoverage: number;
  duplicateRisk: number;
  flags: string[];
  grade: DataQualityGrade;
  computedAt: Timestamp;
}

export interface AdminActivity {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: "user" | "farm" | "audit" | "report" | "pilot" | "system";
  targetId?: string;
  details: string;
  createdAt: Timestamp;
}

export interface UsageMetrics {
  id: string;
  date: string;
  firestoreReads: number;
  firestoreWrites: number;
  storageGb: number;
  apiCalls: number;
  scanJobs: number;
  evidenceUploads: number;
  estimatedCostUsd: number;
}

export type HealthStatus = "healthy" | "degraded" | "down";

export interface SystemHealthStatus {
  overall: HealthStatus;
  database: HealthStatus;
  storage: HealthStatus;
  scanQueue: HealthStatus;
  notifications: HealthStatus;
  lastChecked: string;
  uptimePct: number;
}

export interface AdminPlatformStats {
  totalUsers: number;
  totalFarms: number;
  totalAreaHa: number;
  totalEvidence: number;
  pendingAudits: number;
  activeScans: number;
  errorCount24h: number;
  totalCarbonTonnes: number;
  activePilots: number;
  totalCampaigns: number;
}

// ──────────────────────────────────────────
// PHASE 9 — AI & SCIENTIFIC CREDIBILITY
// ──────────────────────────────────────────

export type AnomalyType =
  | "ndvi_collapse" | "ndvi_spike" | "seasonal_deviation"
  | "evidence_gap"  | "pattern_break";
export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export interface AnomalyEvent {
  month: string;
  ndvi: number;
  expected: number;
  deviation: number;
  zScore: number;
  type: AnomalyType;
}

export interface AnomalyDetection {
  id: string;
  farmId: string;
  userId: string;
  anomalyCount: number;
  maxZScore: number;
  severity: AnomalySeverity;
  events: AnomalyEvent[];
  overallConfidence: number;
  computedAt: Timestamp;
}

export interface CropPrediction {
  id: string;
  farmId: string;
  userId: string;
  predictedCrop: CropType;
  confidence: number;
  alternativeCrops: Array<{ crop: CropType; confidence: number }>;
  signatureMatch: number;
  seasonalAlignment: "kharif" | "rabi" | "zaid" | "perennial";
  computedAt: Timestamp;
}

export interface YieldForecast {
  id: string;
  farmId: string;
  userId: string;
  predictedYieldTonnesHa: number;
  yieldConfidence: number;
  totalProductionTonnes: number;
  benchmarkYieldTonnesHa: number;
  performanceVsBenchmark: number;
  forecastSeason: string;
  computedAt: Timestamp;
}

export interface ForecastDataPoint {
  month: string;
  ndvi: number;
  lower: number;
  upper: number;
  isForecast: boolean;
}

export interface VegetationForecast {
  id: string;
  farmId: string;
  userId: string;
  history: ForecastDataPoint[];
  forecast: ForecastDataPoint[];
  trendSlope: number;
  droughtProbability: number;
  stressProbability: number;
  confidenceInterval: number;
  computedAt: Timestamp;
}

export interface ConfidenceSource {
  source: string;
  score: number;
  weight: number;
}

export type ConfidenceGrade = "high" | "medium" | "low" | "insufficient";

export interface ConfidenceModel {
  id: string;
  farmId: string;
  userId: string;
  overallConfidence: number;
  uncertainty: number;
  sources: ConfidenceSource[];
  grade: ConfidenceGrade;
  recommendation: string;
  computedAt: Timestamp;
}

export interface BenchmarkComparison {
  metric: string;
  farmValue: number;
  districtAvg: number;
  stateAvg: number;
  nationalAvg: number;
  percentile: number;
  delta: number;
}

export interface BenchmarkData {
  id: string;
  farmId: string;
  userId: string;
  comparisons: BenchmarkComparison[];
  overallPercentile: number;
  standoutMetric: string;
  computedAt: Timestamp;
}

export interface DistrictIntelligence {
  district: string;
  state: string;
  farmCount: number;
  avgNDVI: number;
  avgCarbon: number;
  anomalyRate: number;
  avgYieldTha: number;
  dominantCrop: CropType;
  healthScore: number;
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

// ============================================================
// Phase 10 — External Integration & Scale-Ready Infrastructure
// ============================================================

// GEE Integration
export type GEETaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type GEEBandType = "B2" | "B3" | "B4" | "B8" | "B11" | "B12" | "NDVI" | "NDWI" | "EVI";
export type GEESatellite = "Sentinel-2" | "Landsat-8" | "Landsat-9" | "MODIS";

export interface GEEVegetationComposite {
  regionId: string;
  regionName: string;
  compositeType: "monthly" | "seasonal" | "annual";
  startDate: string;
  endDate: string;
  satellite: GEESatellite;
  meanNDVI: number;
  medianNDVI: number;
  stdNDVI: number;
  pixelCount: number;
  cloudFreePct: number;
  areaCoveredKmSq: number;
}

export interface GEETask {
  taskId: string;
  type: "NDVI_COMPOSITE" | "VEGETATION_TREND" | "DROUGHT_ANALYSIS" | "CROP_MAPPING" | "CARBON_ESTIMATE";
  status: GEETaskStatus;
  region: string;
  satellite: GEESatellite;
  startedAt: string;
  completedAt?: string;
  progressPct: number;
  resultSummary?: GEEVegetationComposite;
  errorMessage?: string;
}

// IMD Weather Integration
export interface IMDWeatherStation {
  stationId: string;
  stationName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

export interface IMDWeatherObservation {
  stationId: string;
  stationName: string;
  date: string;
  maxTempC: number;
  minTempC: number;
  rainfallMm: number;
  relativeHumidityPct: number;
  windSpeedKmh: number;
  solarRadiationMJm2?: number;
}

export interface IMDSeasonalForecast {
  season: "Kharif" | "Rabi" | "Zaid";
  year: number;
  state: string;
  rainfallDeparturePct: number;
  temperatureAnomalyC: number;
  droughtProbability: number;
  floodProbability: number;
  forecastConfidence: number;
  issuedDate: string;
}

// ICAR Crop Baselines
export interface ICARCropBaseline {
  cropType: CropType;
  state: string;
  district?: string;
  season: "Kharif" | "Rabi" | "Zaid" | "Annual";
  yieldTonnesHa: number;
  areaMha: number;
  productionMt: number;
  irrigatedPct: number;
  year: number;
  source: "ICAR" | "MoAFW" | "State-DoA";
}

// Copernicus / Sentinel
export type CopernicusProduct = "S1_SAR" | "S2_MSI" | "S3_OLCI" | "S5P_TROPOMI";

export interface CopernicusScene {
  productId: string;
  product: CopernicusProduct;
  acquisitionDate: string;
  orbitNumber: number;
  processingLevel: "L1" | "L2A" | "L2B";
  cloudCoverPct: number;
  sizeGb: number;
  status: "available" | "downloading" | "processed" | "archived";
}

// ISRO Bhuvan
export interface BhuvanLayer {
  layerId: string;
  name: string;
  category: "LULC" | "Soil" | "Watershed" | "Administrative" | "Elevation" | "Crop";
  resolution: number;
  lastUpdated: string;
  wmsEndpoint: string;
  coverageStates: string[];
}

export interface BhuvanNDVIData {
  districtCode: string;
  districtName: string;
  state: string;
  date: string;
  meanNDVI: number;
  areaKmSq: number;
  vegetationCovPct: number;
  anomalyFlag: boolean;
}

// Regional Processing
export type RegionalScanScope = "district" | "state" | "organization";
export type RegionalScanStatus = "queued" | "processing" | "completed" | "failed";

export interface RegionalScanJob {
  id: string;
  scope: RegionalScanScope;
  regionName: string;
  regionCode: string;
  state: string;
  farmCount: number;
  status: RegionalScanStatus;
  progressPct: number;
  startedAt: string;
  completedAt?: string;
  triggeredBy: string;
}

export interface DistrictReport {
  districtName: string;
  state: string;
  totalFarms: number;
  totalAreaHa: number;
  avgNDVI: number;
  avgCarbonTonnesHa: number;
  avgYieldTha: number;
  anomalyCount: number;
  droughtRiskPct: number;
  percentileVsState: number;
  generatedAt: string;
}

export interface StateReport {
  state: string;
  totalFarms: number;
  totalAreaHa: number;
  totalCarbonMt: number;
  avgNDVI: number;
  topDistrict: string;
  bottomDistrict: string;
  droughtAffectedDistrictsPct: number;
  yieldIndexVsNational: number;
  generatedAt: string;
}

// External API System
export type APIKeyStatus = "active" | "suspended" | "revoked" | "expired";
export type APIKeyScope = "read:farms" | "read:ndvi" | "read:carbon" | "read:anomalies" | "read:benchmarks" | "write:farms" | "admin";

export interface APIKey {
  id: string;
  name: string;
  keyPreview: string;
  userId: string;
  orgId?: string;
  scopes: APIKeyScope[];
  status: APIKeyStatus;
  rateLimit: number;
  dailyQuota: number;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  totalCalls: number;
}

export interface APIUsageEntry {
  endpoint: string;
  callsToday: number;
  callsThisMonth: number;
  avgResponseMs: number;
  errorRate: number;
}

// Enterprise Multi-Tenancy
export type OrgTier = "starter" | "professional" | "enterprise";
export type OrgMemberRole = "owner" | "admin" | "analyst" | "viewer";

export interface OrganizationWorkspace {
  id: string;
  name: string;
  slug: string;
  tier: OrgTier;
  contactEmail: string;
  state: string;
  farmCount: number;
  memberCount: number;
  storageUsedGb: number;
  apiCallsThisMonth: number;
  createdAt: string;
  allowExternalAPI: boolean;
  retentionDays: number;
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  name: string;
  role: OrgMemberRole;
  joinedAt: string;
  lastActiveAt?: string;
  farmCount: number;
}

export interface OrgAnalytics {
  orgId: string;
  month: string;
  activeUsers: number;
  totalFarms: number;
  scansPerformed: number;
  reportsGenerated: number;
  apiCallsExternal: number;
  carbonTotalMt: number;
  avgConfidenceScore: number;
}

// Advanced Forecasting
export type DroughtSeverity = "none" | "mild" | "moderate" | "severe" | "extreme";

export interface DroughtForecast {
  regionName: string;
  state: string;
  forecastDate: string;
  horizon30DayPct: number;
  horizon60DayPct: number;
  horizon90DayPct: number;
  currentSPEI: number;
  rainfallDeficitMm: number;
  soilMoistureAnomaly: number;
  cropStressIndex: number;
  severity: DroughtSeverity;
  confidence: number;
}

export interface SeasonalIntelligence {
  season: "Kharif" | "Rabi" | "Zaid";
  year: number;
  state: string;
  sowingWindowStart: string;
  sowingWindowEnd: string;
  peakGrowthMonth: string;
  harvestWindowStart: string;
  harvestWindowEnd: string;
  projectedYieldIndex: number;
  rainfallOutlook: "below-normal" | "normal" | "above-normal";
  recommendedCrops: CropType[];
  riskFactors: string[];
  confidence: number;
}

export interface CropProductivityForecast {
  cropType: CropType;
  state: string;
  season: string;
  forecastYieldTha: number;
  nationalBenchmarkTha: number;
  performanceIndex: number;
  probabilityBelowBenchmark: number;
  climaticRiskScore: number;
  irrigationAdequacyScore: number;
  forecastConfidence: number;
}

// Pipeline System
export type PipelineStage = "ingest" | "validate" | "transform" | "compute" | "store" | "notify";
export type PipelineStatus = "idle" | "running" | "completed" | "failed" | "retrying";

export interface PipelineStageState {
  status: PipelineStatus;
  durationMs?: number;
  error?: string;
}

export interface PipelineJob {
  id: string;
  name: string;
  type: "ndvi_batch" | "carbon_recalc" | "anomaly_sweep" | "benchmark_refresh" | "forecast_update" | "regional_scan";
  status: PipelineStatus;
  currentStage: PipelineStage;
  stages: Record<PipelineStage, PipelineStageState>;
  itemsTotal: number;
  itemsProcessed: number;
  startedAt: string;
  completedAt?: string;
  retryCount: number;
  triggeredBy: "schedule" | "manual" | "webhook";
}

export interface PipelineMetrics {
  avgThroughputPerMin: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  successRate: number;
  errorRate: number;
  queueDepth: number;
  activeWorkers: number;
  totalJobsToday: number;
}

// Infrastructure Observability
export interface APIHealthMetric {
  endpoint: string;
  p50Ms: number;
  p95Ms: number;
  requestsPerMin: number;
  errorRate: number;
  status: "healthy" | "degraded" | "down";
}

export interface InfrastructureStatus {
  timestamp: string;
  overallStatus: "operational" | "degraded" | "incident";
  components: {
    firestore: "up" | "degraded" | "down";
    storage: "up" | "degraded" | "down";
    auth: "up" | "degraded" | "down";
    satellite: "up" | "degraded" | "down";
    externalAPIs: "up" | "degraded" | "down";
    pipeline: "up" | "degraded" | "down";
  };
  activeIncidents: number;
  uptimePct30d: number;
}

// Map Infrastructure
export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  value: number;
  label?: string;
}

export interface RegionalCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  avgNDVI: number;
  avgCarbon: number;
  bounds: [[number, number], [number, number]];
}

// ============================================================
// Phase 11 — Production Hardening & Reliability Layer
// ============================================================

// Observability & Incidents
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "investigating" | "mitigated" | "resolved";

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedComponents: string[];
  startedAt: string;
  resolvedAt?: string;
  mttrMinutes?: number;
  description: string;
}

export interface UptimeRecord {
  component: string;
  date: string;
  uptimePct: number;
  downMinutes: number;
  incidentCount: number;
}

export interface APILatencyBucket {
  endpoint: string;
  hour: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  requestCount: number;
  errorCount: number;
}

// Security & Audit
export type AuditEventType =
  | "login" | "logout" | "login_failed"
  | "farm_create" | "farm_delete" | "farm_update"
  | "api_key_create" | "api_key_revoke"
  | "role_change" | "member_invite" | "member_remove"
  | "report_export" | "evidence_upload"
  | "admin_action" | "bulk_delete";

export interface AuditEntry {
  id: string;
  userId: string;
  email: string;
  eventType: AuditEventType;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  success: boolean;
  metadata?: Record<string, string | number>;
}

export interface AbuseEvent {
  type: "rate_limit_exceeded" | "invalid_key" | "suspicious_pattern" | "geo_block";
  ipAddress: string;
  endpoint: string;
  timestamp: string;
  count: number;
  blocked: boolean;
}

// Backup & Recovery
export type BackupStatusType = "scheduled" | "running" | "completed" | "failed" | "partial";

export interface BackupSnapshot {
  id: string;
  type: "full" | "incremental" | "collection";
  collections: string[];
  status: BackupStatusType;
  recordCount: number;
  sizeGb: number;
  startedAt: string;
  completedAt?: string;
  storagePath: string;
  retentionDays: number;
  triggeredBy: "schedule" | "manual" | "pre-deploy";
}

export interface RecoveryPoint {
  snapshotId: string;
  timestamp: string;
  collectionsIncluded: string[];
  estimatedRecoveryMinutes: number;
  verified: boolean;
}

// Caching
export interface CacheLayerStats {
  layer: "memory" | "cdn" | "regional" | "api";
  hitRate: number;
  missRate: number;
  avgLatencyMs: number;
  keys: number;
  evictions: number;
  sizeKb: number;
}

// Cost Optimization
export type CostCategory = "firestore_reads" | "firestore_writes" | "storage" | "functions" | "egress" | "satellite_api";

export interface CostEntry {
  category: CostCategory;
  month: string;
  costUSD: number;
  units: number;
  unitName: string;
  trend: "increasing" | "stable" | "decreasing";
}

export interface CostOptimization {
  id: string;
  category: CostCategory;
  issue: string;
  recommendation: string;
  estimatedSavingUSD: number;
  effort: "low" | "medium" | "high";
  priority: "critical" | "high" | "medium" | "low";
}

export interface ScalingForecast {
  month: string;
  estimatedFarms: number;
  estimatedCostUSD: number;
  firestoreReadsM: number;
  storageGb: number;
  apiCallsM: number;
}

// Production Analytics
export type WorkflowName = "farm_onboarding" | "evidence_upload" | "report_generation" | "audit_review" | "api_query" | "offline_sync";

export interface WorkflowMetric {
  workflow: WorkflowName;
  completionRate: number;
  avgDurationMs: number;
  p95DurationMs: number;
  dailyVolume: number;
  errorRate: number;
  dropoffStep?: string;
}

export interface RegionalUsageMetric {
  state: string;
  activeFarms: number;
  monthlyScans: number;
  offlineSyncPct: number;
  mobileUsagePct: number;
  avgConfidence: number;
}

// DevOps
export type DeploymentStatus = "pending" | "building" | "deployed" | "failed" | "rolled_back";
export type DeploymentEnvironment = "production" | "preview" | "staging";

export interface DeploymentRecord {
  id: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  branch: string;
  commit: string;
  commitMessage: string;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  pageCount: number;
  url?: string;
}

export interface EnvironmentCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export interface EnvironmentValidation {
  env: DeploymentEnvironment;
  checks: EnvironmentCheck[];
  overallStatus: "healthy" | "degraded" | "failed";
  validatedAt: string;
}

// Reliability Scoring
export interface ReliabilityScore {
  overall: number;
  components: {
    availability: number;
    latency: number;
    errorRate: number;
    security: number;
    dataIntegrity: number;
  };
  slaCompliancePct: number;
  trend: "improving" | "stable" | "degrading";
}

// ============================================================
// Phase 12 — Ecosystem Deployment & Operational Adoption Layer
// ============================================================

// Public Farm Portal
export type SustainabilityTier = "platinum" | "gold" | "silver" | "bronze";

export interface PublicFarmReport {
  farmId: string;
  farmName: string;
  ownerName: string;
  state: string;
  district: string;
  areaHectares: number;
  cropType: string;
  sustainabilityTier: SustainabilityTier;
  carbonScoreTonnes: number;
  ndviScore: number;
  ndviTrend: "improving" | "stable" | "declining";
  verificationStatus: "verified" | "pending" | "unverified";
  verifiedBy?: string;
  lastUpdated: string;
  reportUrl: string;
  badges: string[];
  carbonCredits: number;
  confidenceLevel: number;
}

// Partner & NGO Onboarding
export type OnboardingStepStatus = "pending" | "in_progress" | "completed" | "skipped";
export type PartnerType = "ngo" | "government" | "research" | "enterprise" | "cooperative";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: OnboardingStepStatus;
  completedAt?: string;
  required: boolean;
}

export interface PartnerOrg {
  id: string;
  name: string;
  type: PartnerType;
  state: string;
  contactEmail: string;
  contactName: string;
  farmCount: number;
  activeSince: string;
  onboardingProgress: number;
  tier: "starter" | "growth" | "enterprise";
  status: "active" | "onboarding" | "suspended" | "pending";
}

export interface OnboardingFlow {
  orgId: string;
  orgName: string;
  partnerType: PartnerType;
  steps: OnboardingStep[];
  overallProgress: number;
  startedAt: string;
  estimatedCompletionDays: number;
}

// Government Regional Monitoring
export interface StateMonitorSummary {
  state: string;
  activeFarms: number;
  totalAreaHa: number;
  avgCarbonScore: number;
  avgNdviScore: number;
  droughtRiskLevel: "low" | "moderate" | "high" | "critical";
  cropDiversity: number;
  verifiedFarms: number;
  alertCount: number;
  lastScanDate: string;
}

export interface DistrictMonitor {
  district: string;
  state: string;
  farmCount: number;
  avgNdvi: number;
  carbonTonnes: number;
  rainfallMm: number;
  soilMoistureIndex: number;
  riskScore: number;
  dominantCrop: string;
}

// Deployment Templates
export type DeploymentTemplateType = "district" | "state" | "ngo" | "enterprise" | "pilot";

export interface DeploymentTemplate {
  id: string;
  name: string;
  type: DeploymentTemplateType;
  description: string;
  estimatedFarms: number;
  setupDays: number;
  featuresIncluded: string[];
  requirements: string[];
  usedBy: number;
}

export interface PilotRollout {
  id: string;
  name: string;
  region: string;
  partnerOrg: string;
  targetFarms: number;
  activeFarms: number;
  startDate: string;
  targetDate: string;
  progressPct: number;
  status: "planning" | "active" | "completed" | "paused";
  milestones: { label: string; achieved: boolean; date: string }[];
}

// Compliance Reporting
export type ComplianceStandard = "ISO14064" | "UNFCCC" | "GoldStandard" | "VCS" | "IPCC";

export interface ComplianceReport {
  id: string;
  title: string;
  standard: ComplianceStandard;
  period: string;
  farmsIncluded: number;
  totalCarbonTonnes: number;
  verificationStatus: "draft" | "pending_review" | "approved" | "submitted";
  generatedAt: string;
  methodology: string;
  signedBy?: string;
}

export interface AuditExportRecord {
  farmId: string;
  farmName: string;
  period: string;
  carbonTonnes: number;
  ndviAvg: number;
  evidenceCount: number;
  auditorId: string;
  verifiedAt: string;
  standard: ComplianceStandard;
}

// Interoperability & Webhooks
export type WebhookEvent =
  | "farm.created" | "farm.updated" | "farm.deleted"
  | "carbon.calculated" | "report.generated" | "audit.completed"
  | "incident.created" | "scan.completed";

export interface WebhookConfig {
  id: string;
  orgId: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  secret: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

export interface ExportConnector {
  id: string;
  name: string;
  type: "csv" | "json" | "geojson" | "shapefile" | "pdf";
  description: string;
  endpoint: string;
  lastExported?: string;
  recordCount: number;
}

// Field Operations
export interface FieldSOP {
  id: string;
  title: string;
  category: "evidence_collection" | "boundary_survey" | "soil_sampling" | "crop_assessment" | "audit_review";
  steps: { step: number; instruction: string; required: boolean }[];
  estimatedMinutes: number;
  lastRevised: string;
  version: string;
}

export interface AuditorAssignment {
  id: string;
  auditorName: string;
  auditorEmail: string;
  region: string;
  assignedFarms: number;
  completedAudits: number;
  pendingAudits: number;
  avgCompletionDays: number;
  status: "active" | "on_leave" | "overloaded";
  nextDeadline: string;
}

// Ecosystem Analytics
export interface PartnerAdoptionMetric {
  orgName: string;
  partnerType: PartnerType;
  state: string;
  farmsOnboarded: number;
  monthlyScans: number;
  reportingRate: number;
  adoptionScore: number;
  joinedMonthsAgo: number;
}

export interface EcosystemHealth {
  totalPartners: number;
  activePartners: number;
  totalFarmsRegistered: number;
  monthlyActiveOrgs: number;
  avgOnboardingDays: number;
  reportSubmissionRate: number;
  verificationCoverageRate: number;
  ecosystemScore: number;
}

// ─── Phase 13: Scientific Validation & Pilot Operations ───────────────────────

export interface GroundTruthObservation {
  id: string;
  farmId: string;
  farmName: string;
  district: string;
  state: string;
  observedAt: string;
  observerName: string;
  ndviFieldMeasured: number;
  ndviSatelliteEstimate: number;
  carbonFieldTonnes: number;
  carbonModelledTonnes: number;
  soilSampleDepthCm: number;
  biomassWeightKg: number;
  cropStage: string;
  notes: string;
  photoUrls: string[];
  validated: boolean;
}

export type ValidationScoreGrade = "A" | "B" | "C" | "D" | "F";

export interface ValidationScore {
  farmId: string;
  ndviMae: number;
  ndviRmse: number;
  carbonMae: number;
  carbonRmse: number;
  correlationCoefficient: number;
  biasPercent: number;
  observationCount: number;
  grade: ValidationScoreGrade;
  lastValidated: string;
}

export interface FieldVerificationMission {
  id: string;
  missionName: string;
  leadAuditor: string;
  district: string;
  state: string;
  targetFarms: number;
  completedFarms: number;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "completed" | "cancelled";
  groundTruthCount: number;
  anomaliesFound: number;
}

export interface ModelAccuracyMetric {
  modelName: string;
  version: string;
  datasetSize: number;
  ndviR2: number;
  carbonR2: number;
  droughtAUC: number;
  anomalyPrecision: number;
  anomalyRecall: number;
  evaluatedAt: string;
  benchmark: "passing" | "marginal" | "failing";
}

export interface NDVIAccuracyRecord {
  district: string;
  state: string;
  sentinelNDVI: number;
  fieldNDVI: number;
  absoluteError: number;
  percentError: number;
  sampleCount: number;
  season: string;
  year: number;
}

export interface ForecastAccuracyRecord {
  horizonDays: number;
  parameter: "drought_prob" | "ndvi_change" | "yield_index";
  mae: number;
  rmse: number;
  bias: number;
  skillScore: number;
  evaluationPeriod: string;
}

export interface CalibrationCoefficient {
  id: string;
  paramName: string;
  description: string;
  currentValue: number;
  defaultValue: number;
  minBound: number;
  maxBound: number;
  lastCalibrated: string;
  calibratedBy: string;
  notes: string;
}

export interface RegionalCalibration {
  state: string;
  district: string;
  ndviBiasCorrection: number;
  carbonScaleFactor: number;
  droughtThresholdAdjust: number;
  sampleCount: number;
  r2Score: number;
  calibratedAt: string;
  approved: boolean;
}

export interface SeasonalCorrectionFactor {
  season: "kharif" | "rabi" | "zaid";
  cropType: string;
  ndviMultiplier: number;
  carbonMultiplier: number;
  validatedYears: number[];
}

export interface PilotPerformanceMetric {
  pilotId: string;
  pilotName: string;
  state: string;
  district: string;
  farmsEnrolled: number;
  farmsActive: number;
  ndviCoveragePercent: number;
  auditCompletionRate: number;
  reportingOnTimeRate: number;
  avgDataQualityScore: number;
  carbonCreditsMinted: number;
  operationalUptimePct: number;
  startDate: string;
  reviewDate: string;
  status: "healthy" | "at_risk" | "stalled";
}

export interface ValidationDataset {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  states: string[];
  seasons: string[];
  cropTypes: string[];
  ndviObservations: number;
  carbonObservations: number;
  createdAt: string;
  version: string;
  isPublic: boolean;
}

export interface BenchmarkReport {
  id: string;
  title: string;
  reportDate: string;
  coverageStates: number;
  coverageDistricts: number;
  totalObservations: number;
  ndviAccuracyGrade: ValidationScoreGrade;
  carbonAccuracyGrade: ValidationScoreGrade;
  overallAccuracyPct: number;
  improvementFromPrior: number;
  findings: string[];
  recommendations: string[];
}

export interface OperationalHealthMetric {
  component: string;
  category: "data_pipeline" | "model_inference" | "field_sync" | "reporting" | "storage";
  successRatePct: number;
  avgLatencyMs: number;
  errorCount24h: number;
  lastCheckAt: string;
  status: "healthy" | "degraded" | "down";
}

export interface ResearchDataset {
  id: string;
  title: string;
  dataType: "ndvi_timeseries" | "carbon_samples" | "soil_profiles" | "biomass_survey" | "drone_imagery";
  recordCount: number;
  spatialCoverage: string;
  temporalRange: string;
  license: "CC-BY-4.0" | "CC-BY-NC-4.0" | "proprietary";
  downloadCount: number;
  citationCount: number;
  createdAt: string;
  isPublished: boolean;
}

// ─── Phase 14: National Operations & Trust Layer ─────────────────────────────

// National Command Center
export interface StateAggregation {
  state: string;
  region: "north" | "south" | "east" | "west" | "central" | "northeast";
  totalFarms: number;
  activeFarms: number;
  totalHectares: number;
  avgNDVI: number;
  droughtRiskPct: number;
  carbonTonnesTotal: number;
  verifiedFarmsPct: number;
  operationalScore: number;
  lastSyncAt: string;
  alertCount: number;
}

export interface NationalDistrictReport {
  district: string;
  state: string;
  farms: number;
  ndviAvg: number;
  ndviTrend: "up" | "down" | "stable";
  carbonEstimate: number;
  droughtRisk: "low" | "medium" | "high" | "critical";
  auditsPending: number;
  lastUpdated: string;
}

export interface NationalCommandMetric {
  label: string;
  value: string | number;
  unit: string;
  trend: number;
  status: "healthy" | "warning" | "critical";
}

// Trust & Verification Registry
export type VerificationStatus = "pending" | "in_review" | "verified" | "rejected" | "revoked";

export interface VerificationRecord {
  id: string;
  farmId: string;
  farmName: string;
  state: string;
  auditOrg: string;
  auditorName: string;
  submittedAt: string;
  verifiedAt: string | null;
  status: VerificationStatus;
  carbonClaimedTonnes: number;
  carbonVerifiedTonnes: number | null;
  confidenceLevel: number;
  certificateId: string | null;
  standard: string;
}

export interface AuditLineage {
  recordId: string;
  farmId: string;
  events: Array<{
    timestamp: string;
    actor: string;
    action: string;
    detail: string;
    hash: string;
  }>;
}

export interface TransparencyLog {
  id: string;
  logType: "verification" | "calibration" | "model_update" | "policy_change" | "data_release";
  description: string;
  actor: string;
  affectedEntities: number;
  timestamp: string;
  isPublic: boolean;
  referenceId: string;
}

export interface ConfidenceCertification {
  certId: string;
  farmId: string;
  farmName: string;
  state: string;
  issuedAt: string;
  expiresAt: string;
  ndviConfidence: number;
  carbonConfidence: number;
  overallConfidence: number;
  tier: "platinum" | "gold" | "silver" | "bronze";
  issuer: string;
}

// Cross-State Intelligence
export interface CrossStateNDVITrend {
  state: string;
  season: string;
  ndviQ1: number;
  ndviQ2: number;
  ndviQ3: number;
  ndviQ4: number;
  yoyChange: number;
  cropHealthIndex: number;
}

export interface DroughtRiskAggregation {
  state: string;
  district: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  affectedHectares: number;
  affectedFarms: number;
  precipitationDeficit: number;
  ndviAnomaly: number;
  forecastHorizonDays: number;
  alertIssued: boolean;
}

export interface CropIntelligence {
  cropType: string;
  totalHectares: number;
  states: number;
  avgNDVI: number;
  avgCarbonTha: number;
  yieldIndexPct: number;
  healthStatus: "excellent" | "good" | "fair" | "poor";
  season: string;
}

// Scientific Oversight
export type ReviewStatus = "submitted" | "under_review" | "approved" | "revision_requested" | "rejected";

export interface PeerReviewRecord {
  id: string;
  title: string;
  submittedBy: string;
  reviewedBy: string[];
  submittedAt: string;
  deadline: string;
  status: ReviewStatus;
  reviewType: "methodology" | "calibration" | "validation" | "report";
  summary: string;
  revisionRound: number;
}

export interface CalibrationApproval {
  id: string;
  paramName: string;
  proposedValue: number;
  currentValue: number;
  justification: string;
  proposedBy: string;
  reviewedBy: string | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  resolvedAt: string | null;
}

export interface MethodologyRevision {
  id: string;
  section: string;
  revision: string;
  reason: string;
  approvedBy: string;
  effectiveDate: string;
  version: string;
  impactedModels: string[];
}

// Governance
export interface GovernanceLog {
  id: string;
  category: "policy" | "access" | "data" | "compliance" | "deployment" | "audit";
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  outcome: "success" | "failure" | "pending";
  details: string;
  ipAddress: string;
}

export interface OperationalPolicy {
  id: string;
  title: string;
  category: "data_retention" | "access_control" | "audit_frequency" | "verification_sla" | "deployment_gate";
  description: string;
  currentValue: string;
  effectiveDate: string;
  owner: string;
  status: "active" | "draft" | "deprecated";
}

export interface ComplianceTimeline {
  date: string;
  event: string;
  standard: string;
  status: "completed" | "upcoming" | "overdue";
  responsible: string;
}

// Data Reliability Engine
export interface RegionalConfidence {
  state: string;
  ndviConfidence: number;
  carbonConfidence: number;
  droughtConfidence: number;
  overallConfidence: number;
  sampleDensityPerHectare: number;
  lastCalibrationDaysAgo: number;
  reliabilityGrade: ValidationScoreGrade;
}

export interface ValidationDensity {
  district: string;
  state: string;
  farmCount: number;
  observationCount: number;
  observationsPerFarm: number;
  coveragePct: number;
  densityScore: number;
}

export interface DataReliabilityScore {
  region: string;
  overallScore: number;
  dataFreshnessPct: number;
  validationCoveragePct: number;
  calibrationCurrencyPct: number;
  operationalConsistencyPct: number;
  lastAssessed: string;
}

// Institutional Partners
export interface InstitutionalPartner {
  id: string;
  name: string;
  type: "government" | "research" | "ngo" | "multilateral" | "finance";
  country: string;
  state: string | null;
  role: string;
  joinedAt: string;
  farmsOverseen: number;
  workspacesActive: number;
  governanceLevel: "observer" | "contributor" | "validator" | "governing_body";
  contactName: string;
  contactEmail: string;
}

export interface InstitutionalWorkspace {
  id: string;
  partnerId: string;
  partnerName: string;
  workspaceName: string;
  states: string[];
  farmsManaged: number;
  activeUsers: number;
  lastActivityAt: string;
  dataAccessLevel: "read_only" | "read_write" | "admin";
  reportsGenerated: number;
}
