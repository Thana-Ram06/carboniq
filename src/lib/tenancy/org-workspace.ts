/**
 * Enterprise Multi-Tenancy — VASUDHA Phase 10
 *
 * Organization workspace management: isolated data spaces,
 * member RBAC, tier-based feature flags, and analytics.
 */

import type { OrganizationWorkspace, WorkspaceMember, OrgAnalytics, OrgTier } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const TIER_FEATURES: Record<OrgTier, {
  maxFarms: number;
  maxMembers: number;
  storageGb: number;
  dailyAPIQuota: number;
  retentionDays: number;
  features: string[];
}> = {
  starter: {
    maxFarms: 25,
    maxMembers: 3,
    storageGb: 5,
    dailyAPIQuota: 1000,
    retentionDays: 90,
    features: ["NDVI Analytics", "Carbon Estimation", "Basic Reports"],
  },
  professional: {
    maxFarms: 500,
    maxMembers: 20,
    storageGb: 50,
    dailyAPIQuota: 10000,
    retentionDays: 365,
    features: ["NDVI Analytics", "Carbon Estimation", "Advanced Reports", "AI Intelligence", "External API", "Audit System"],
  },
  enterprise: {
    maxFarms: 50000,
    maxMembers: 1000,
    storageGb: 2000,
    dailyAPIQuota: 100000,
    retentionDays: 2555,
    features: ["All Professional", "Regional Processing", "GEE Integration", "Satellite Archive", "Custom SLA", "Dedicated Support"],
  },
};

export function getTierFeatures(tier: OrgTier) {
  return TIER_FEATURES[tier];
}

export function generateSampleOrg(seed: string, tier: OrgTier = "professional"): OrganizationWorkspace {
  const s = seedHash(seed);
  const ORG_NAMES = ["AgriTech Solutions", "Krishi Digital", "FarmSmart India", "Green Carbon Co.", "Kisan Intelligence"];
  const STATES = ["Maharashtra", "Punjab", "Uttar Pradesh", "Karnataka", "Gujarat"];
  const nameIdx = s % ORG_NAMES.length;

  return {
    id: `org_${s.toString(16)}`,
    name: ORG_NAMES[nameIdx],
    slug: ORG_NAMES[nameIdx].toLowerCase().replace(/\s+/g, "-"),
    tier,
    contactEmail: `admin@${ORG_NAMES[nameIdx].toLowerCase().replace(/\s+/g, "")}.in`,
    state: STATES[s % STATES.length],
    farmCount: Math.round(sf(s + 1, 12, tier === "enterprise" ? 2000 : 400)),
    memberCount: Math.round(sf(s + 2, 2, tier === "enterprise" ? 80 : 15)),
    storageUsedGb: parseFloat(sf(s + 3, 0.5, TIER_FEATURES[tier].storageGb * 0.7).toFixed(2)),
    apiCallsThisMonth: Math.round(sf(s + 4, 500, TIER_FEATURES[tier].dailyAPIQuota * 12)),
    createdAt: new Date(Date.now() - Math.round(sf(s + 5, 30, 730)) * 86400000).toISOString(),
    allowExternalAPI: tier !== "starter",
    retentionDays: TIER_FEATURES[tier].retentionDays,
  };
}

export function generateSampleMembers(orgId: string, count = 5): WorkspaceMember[] {
  const NAMES = ["Rajesh Kumar", "Priya Sharma", "Anita Verma", "Suresh Patel", "Deepika Singh", "Mohammed Iqbal", "Sunita Rao"];
  const ROLES: WorkspaceMember["role"][] = ["owner", "admin", "analyst", "analyst", "viewer"];

  return Array.from({ length: count }, (_, i) => {
    const s = seedHash(`${orgId}-member-${i}`);
    const name = NAMES[s % NAMES.length];
    const farmCount = Math.round(sf(s + 1, 2, 80));
    return {
      userId: `usr_${s.toString(16)}`,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.in`,
      name,
      role: ROLES[i % ROLES.length],
      joinedAt: new Date(Date.now() - Math.round(sf(s + 2, 1, 400)) * 86400000).toISOString(),
      lastActiveAt: new Date(Date.now() - Math.round(sf(s + 3, 0, 7)) * 86400000).toISOString(),
      farmCount,
    };
  });
}

export function generateOrgAnalytics(orgId: string, monthsBack = 6): OrgAnalytics[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  return Array.from({ length: monthsBack }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
    const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
    const s = seedHash(`${orgId}-${label}`);
    return {
      orgId,
      month: label,
      activeUsers: Math.round(sf(s, 2, 25)),
      totalFarms: Math.round(sf(s + 1, 50, 400)),
      scansPerformed: Math.round(sf(s + 2, 80, 2400)),
      reportsGenerated: Math.round(sf(s + 3, 10, 180)),
      apiCallsExternal: Math.round(sf(s + 4, 200, 8000)),
      carbonTotalMt: parseFloat(sf(s + 5, 0.5, 12.0).toFixed(3)),
      avgConfidenceScore: Math.round(sf(s + 6, 62, 88)),
    };
  });
}
