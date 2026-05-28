import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _analytics: Analytics | null = null;

export function initFirebase() {
  if (typeof window === "undefined") return null;
  if (_app) return _app;
  _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _storage = getStorage(_app);
  if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    _analytics = getAnalytics(_app);
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  initFirebase();
  return _auth!;
}

export function getFirebaseDb(): Firestore {
  initFirebase();
  return _db!;
}

export function getFirebaseStorage(): FirebaseStorage {
  initFirebase();
  return _storage!;
}

export { _auth as auth, _db as db, _storage as storage, _analytics as analytics };

export const COLLECTIONS = {
  USERS: "users",
  FARMS: "farms",
  FARM_BOUNDARIES: "farm_boundaries",
  SATELLITE_ANALYTICS: "satellite_analytics",
  CARBON_ESTIMATIONS: "carbon_estimations",
  REPORTS: "reports",
  ACTIVITY: "activity",
  SCAN_JOBS: "scan_jobs",
  NDVI_HISTORY: "ndvi_history",
  FARM_INSIGHTS: "farm_insights",
  CARBON_ANALYTICS: "carbon_analytics",
  VEGETATION_SCORES: "vegetation_scores",
  MONITORING_JOBS: "monitoring_jobs",
  WEATHER_ANALYTICS: "weather_analytics",
  RISK_ALERTS: "risk_alerts",
  FARM_TIMELINES: "farm_timelines",
  // Phase 5 — MRV & Verification
  FARM_EVIDENCE: "farm_evidence",
  AUDIT_REVIEWS: "audit_reviews",
  ORGANIZATIONS: "organizations",
  MONITORING_REPORTS: "monitoring_reports",
  VERIFICATION_LOGS: "verification_logs",
  // Phase 6 — Enterprise
  NOTIFICATIONS: "notifications",
  ACTIVITY_EVENTS: "activity_events",
  USER_PROFILES: "user_profiles",
  // Phase 8 — Scalability & Observability
  PLATFORM_LOGS: "platform_logs",
  PILOT_ORGS: "pilot_orgs",
  FIELD_CAMPAIGNS: "field_campaigns",
  DATA_QUALITY: "data_quality",
  ADMIN_ACTIVITY: "admin_activity",
  USAGE_METRICS: "usage_metrics",
  // Phase 9 — AI & Scientific Credibility
  ANOMALY_MODELS: "anomaly_models",
  CROP_PREDICTIONS: "crop_predictions",
  YIELD_FORECASTS: "yield_forecasts",
  FORECAST_HISTORY: "forecast_history",
  CONFIDENCE_MODELS: "confidence_models",
  // Phase 10 — External Integration & Scale
  GEE_TASKS: "gee_tasks",
  REGIONAL_SCANS: "regional_scans",
  DISTRICT_REPORTS: "district_reports",
  STATE_REPORTS: "state_reports",
  API_KEYS: "api_keys",
  API_USAGE: "api_usage",
  ORG_WORKSPACES: "org_workspaces",
  ORG_MEMBERS: "org_members",
  ORG_ANALYTICS: "org_analytics",
  DROUGHT_FORECASTS: "drought_forecasts",
  SEASONAL_INTEL: "seasonal_intel",
  PIPELINE_JOBS: "pipeline_jobs",
  INFRA_STATUS: "infra_status",
} as const;
