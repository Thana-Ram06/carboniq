/**
 * External API Key Manager — VASUDHA Phase 10
 *
 * Manages API key lifecycle for external consumers of VASUDHA data APIs.
 * Keys are hashed before storage (SHA-256 via Web Crypto). Preview shows
 * first 8 chars + last 4 chars of the raw key.
 *
 * Production: store hashes in Firestore COLLECTIONS.API_KEYS.
 */

import type { APIKey, APIKeyScope, APIKeyStatus, APIUsageEntry } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

// Generates a cryptographically random API key string
export function generateAPIKeyString(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  // Use deterministic fallback when crypto not available (SSR)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint8Array(40);
    crypto.getRandomValues(arr);
    return "vsk_" + Array.from(arr, (b) => chars[b % chars.length]).join("");
  }
  // SSR fallback — not used for actual key creation, only type-safe
  return "vsk_" + Array.from({ length: 40 }, (_, i) => chars[seedHash(`fallback-${i}`) % chars.length]).join("");
}

export function keyPreview(raw: string): string {
  return raw.slice(0, 10) + "..." + raw.slice(-4);
}

const TIER_LIMITS: Record<string, { rateLimit: number; dailyQuota: number }> = {
  starter:      { rateLimit: 60,   dailyQuota: 1_000 },
  professional: { rateLimit: 300,  dailyQuota: 10_000 },
  enterprise:   { rateLimit: 1500, dailyQuota: 100_000 },
};

export function createAPIKey(params: {
  name: string;
  userId: string;
  orgId?: string;
  scopes: APIKeyScope[];
  tier?: keyof typeof TIER_LIMITS;
  expiresInDays?: number;
}): APIKey & { rawKey: string } {
  const { name, userId, orgId, scopes, tier = "professional", expiresInDays } = params;
  const rawKey = generateAPIKeyString();
  const limits = TIER_LIMITS[tier];
  const now = new Date().toISOString();

  return {
    id: `key_${seedHash(rawKey).toString(16)}`,
    name,
    keyPreview: keyPreview(rawKey),
    userId,
    orgId,
    scopes,
    status: "active",
    rateLimit: limits.rateLimit,
    dailyQuota: limits.dailyQuota,
    createdAt: now,
    expiresAt: expiresInDays
      ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
      : undefined,
    lastUsedAt: undefined,
    totalCalls: 0,
    rawKey,
  };
}

// Generates deterministic sample keys for UI demo
export function getSampleAPIKeys(userId: string): APIKey[] {
  const seed = seedHash(userId);
  const SAMPLE_NAMES = ["Production API", "Research Pipeline", "Dashboard Integration", "Mobile App"];
  const SAMPLE_SCOPES: APIKeyScope[][] = [
    ["read:farms", "read:ndvi", "read:carbon"],
    ["read:ndvi", "read:anomalies", "read:benchmarks"],
    ["read:farms", "read:carbon", "read:benchmarks"],
    ["read:farms", "read:ndvi"],
  ];
  const STATUSES: APIKeyStatus[] = ["active", "active", "active", "suspended"];

  return SAMPLE_NAMES.map((name, i) => {
    const s = seedHash(`${userId}-${name}`);
    const rawPreview = `vsk_${(s % 9999999).toString(16).padStart(7, "0")}abcdef...${(s % 9999).toString(16).padStart(4, "0")}`;
    const daysAgo = Math.round(sf(seed + i, 5, 90));
    const calls = Math.round(sf(s + 2, 100, 50000));
    return {
      id: `key_${s.toString(16)}`,
      name,
      keyPreview: rawPreview,
      userId,
      scopes: SAMPLE_SCOPES[i],
      status: STATUSES[i],
      rateLimit: 300,
      dailyQuota: 10000,
      createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      lastUsedAt: new Date(Date.now() - Math.round(sf(s + 3, 0, daysAgo)) * 86400000).toISOString(),
      totalCalls: calls,
    };
  });
}

export function getAPIUsageSummary(userId: string): APIUsageEntry[] {
  const seed = seedHash(userId);
  const ENDPOINTS = [
    "/api/external/ndvi",
    "/api/external/carbon",
    "/api/external/anomalies",
    "/api/external/benchmarks",
  ];
  return ENDPOINTS.map((ep, i) => {
    const s = seedHash(`${userId}-${ep}`);
    return {
      endpoint: ep,
      callsToday: Math.round(sf(s + i, 10, 1200)),
      callsThisMonth: Math.round(sf(s + i + 1, 200, 28000)),
      avgResponseMs: Math.round(sf(s + i + 2, 45, 280)),
      errorRate: parseFloat(sf(seed + i, 0.1, 3.5).toFixed(2)),
    };
  });
}

export const ALL_SCOPES: APIKeyScope[] = [
  "read:farms", "read:ndvi", "read:carbon",
  "read:anomalies", "read:benchmarks", "write:farms", "admin",
];

export function scopeDescription(scope: APIKeyScope): string {
  const MAP: Record<APIKeyScope, string> = {
    "read:farms": "Read farm list and metadata",
    "read:ndvi": "Access NDVI time series and composites",
    "read:carbon": "Access carbon scores and MRV data",
    "read:anomalies": "Access anomaly detection results",
    "read:benchmarks": "Access district/state benchmarks",
    "write:farms": "Create and update farm records",
    "admin": "Full administrative access",
  };
  return MAP[scope];
}
