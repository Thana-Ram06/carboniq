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
} as const;
