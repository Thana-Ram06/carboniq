import type { PartnerOrg, OnboardingFlow, OnboardingStep, PartnerType } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const ONBOARDING_STEPS: Omit<OnboardingStep, "status" | "completedAt">[] = [
  { id: "org-profile",     title: "Organisation Profile",       description: "Set up org name, logo, state jurisdiction, and primary contact",                required: true },
  { id: "team-invite",     title: "Invite Team Members",        description: "Invite auditors, field agents, and managers to join workspace",                required: true },
  { id: "farm-import",     title: "Import Farm Registry",       description: "Upload farm list via CSV or connect to existing state portal",                 required: true },
  { id: "boundary-setup",  title: "Farm Boundary Setup",        description: "Define GPS boundaries for registered farms — required for satellite monitoring", required: true },
  { id: "api-key",         title: "Generate API Key",           description: "Create API credentials for external integrations and webhook delivery",          required: false },
  { id: "webhook",         title: "Configure Webhooks",         description: "Set up event delivery to your data systems for real-time updates",              required: false },
  { id: "pilot-scan",      title: "Run Pilot NDVI Scan",        description: "Execute a test satellite scan on 5 farms to verify setup",                     required: true },
  { id: "compliance-map",  title: "Map Compliance Standard",    description: "Select ISO 14064, VCS, or GoldStandard methodology for reporting",              required: true },
];

const PARTNER_ORGS: Array<{
  name: string; type: PartnerType; state: string; contact: string; email: string;
}> = [
  { name: "Krishi Vikas Foundation",    type: "ngo",        state: "Punjab",          contact: "Dr. Anjali Singh",    email: "anjali@krishivikas.org" },
  { name: "Rajasthan Agri Cooperative", type: "cooperative",state: "Rajasthan",       contact: "Ramesh Choudhary",    email: "rchoudhary@rajcoop.in" },
  { name: "Karnataka State FPO",        type: "government", state: "Karnataka",       contact: "IAS Suresh Murthy",   email: "suresh@karnataka.gov.in" },
  { name: "TechFarm Solutions",         type: "enterprise", state: "Maharashtra",     contact: "Vikram Nair",         email: "vnair@techfarm.in" },
  { name: "ICAR Research Station",      type: "research",   state: "Uttar Pradesh",   contact: "Prof. Meena Devi",    email: "meena.devi@icar.gov.in" },
  { name: "Haryana Green Carbon",       type: "ngo",        state: "Haryana",         contact: "Pooja Malhotra",      email: "pooja@hgcarbon.org" },
  { name: "Gujarat Farmer Alliance",    type: "cooperative",state: "Gujarat",         contact: "Kiran Patel",         email: "kiran@gfa.coop" },
];

export function getPartnerOrgs(): PartnerOrg[] {
  return PARTNER_ORGS.map((p, i) => {
    const seed = seedHash(`partner-${i}`);
    const farmCount = Math.round(sf(seed, 28, 480));
    const progress = Math.round(sf(seed + 1, 20, 100));
    const statuses: PartnerOrg["status"][] = ["active", "active", "active", "onboarding", "pending"];
    return {
      id: `ORG-${(seed % 9999).toString().padStart(4, "0")}`,
      name: p.name,
      type: p.type,
      state: p.state,
      contactEmail: p.email,
      contactName: p.contact,
      farmCount,
      activeSince: new Date(Date.now() - Math.round(sf(seed + 2, 30, 540)) * 86400000).toISOString().split("T")[0],
      onboardingProgress: progress,
      tier: progress >= 80 ? "enterprise" : progress >= 50 ? "growth" : "starter",
      status: statuses[seed % statuses.length],
    };
  });
}

export function getOnboardingFlow(orgId: string): OnboardingFlow {
  const seed = seedHash(orgId);
  const org = getPartnerOrgs()[seed % PARTNER_ORGS.length];
  const completedCount = seed % (ONBOARDING_STEPS.length + 1);

  const steps: OnboardingStep[] = ONBOARDING_STEPS.map((s, i) => ({
    ...s,
    status: i < completedCount ? "completed" : i === completedCount ? "in_progress" : "pending",
    completedAt: i < completedCount
      ? new Date(Date.now() - (completedCount - i) * 2 * 86400000).toISOString()
      : undefined,
  }));

  const overall = Math.round((completedCount / ONBOARDING_STEPS.length) * 100);

  return {
    orgId,
    orgName: org.name,
    partnerType: org.type,
    steps,
    overallProgress: overall,
    startedAt: new Date(Date.now() - Math.round(sf(seed, 5, 45)) * 86400000).toISOString(),
    estimatedCompletionDays: Math.round(sf(seed + 1, 3, 18)),
  };
}

export function getPartnerTypeConfig(type: PartnerType): { label: string; color: string; bg: string; border: string } {
  const configs: Record<PartnerType, { label: string; color: string; bg: string; border: string }> = {
    ngo:         { label: "NGO",         color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
    government:  { label: "Government",  color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
    research:    { label: "Research",    color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    enterprise:  { label: "Enterprise",  color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    cooperative: { label: "Cooperative", color: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/20" },
  };
  return configs[type];
}
