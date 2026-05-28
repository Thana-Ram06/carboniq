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
