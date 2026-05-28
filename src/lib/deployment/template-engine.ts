import type { DeploymentTemplate, PilotRollout, DeploymentTemplateType } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export const DEPLOYMENT_TEMPLATES: DeploymentTemplate[] = [
  {
    id: "TMPL-DISTRICT",
    name: "District Rollout Kit",
    type: "district",
    description: "Complete deployment package for a single revenue district. Includes satellite monitoring for up to 500 farms, district dashboard, and monthly compliance reports.",
    estimatedFarms: 500,
    setupDays: 14,
    featuresIncluded: ["Satellite NDVI", "Carbon Estimation", "District Dashboard", "Monthly Reports", "Auditor Portal"],
    requirements: ["State government MoU", "GPS boundary data", "2 trained field agents"],
    usedBy: 8,
  },
  {
    id: "TMPL-STATE",
    name: "State Intelligence Package",
    type: "state",
    description: "Full state-level deployment with multi-district coordination, state-level analytics, and UNFCCC-compliant carbon reporting.",
    estimatedFarms: 5000,
    setupDays: 45,
    featuresIncluded: ["Multi-district Dashboard", "State Analytics", "UNFCCC Reporting", "API Access", "Webhook Integration", "Advanced Forecasting"],
    requirements: ["State Agriculture Dept approval", "Village-level boundary data", "10+ field agents", "Dedicated account manager"],
    usedBy: 3,
  },
  {
    id: "TMPL-NGO",
    name: "NGO/Cooperative Kit",
    type: "ngo",
    description: "Tailored for NGOs and farmer cooperatives. Emphasises easy onboarding, mobile-first field collection, and shareable farm certificates.",
    estimatedFarms: 200,
    setupDays: 7,
    featuresIncluded: ["Mobile App", "Sustainability Badges", "Farm Certificates", "Evidence Upload", "Basic Reporting"],
    requirements: ["Organisation registration", "Signed data privacy agreement"],
    usedBy: 14,
  },
  {
    id: "TMPL-ENTERPRISE",
    name: "Enterprise Carbon Portfolio",
    type: "enterprise",
    description: "For agribusinesses managing large farmer supply chains. Includes portfolio-level carbon analytics, Scope 3 reporting, and API integrations.",
    estimatedFarms: 2000,
    setupDays: 30,
    featuresIncluded: ["Portfolio Analytics", "Scope 3 Reporting", "Custom API", "Webhook Suite", "Compliance Exports", "SLA Support"],
    requirements: ["Enterprise agreement", "ERP/SAP integration details", "Security review"],
    usedBy: 5,
  },
  {
    id: "TMPL-PILOT",
    name: "Rapid Pilot (30 Farms)",
    type: "pilot",
    description: "3-week proof-of-concept for any organisation. 30-farm pilot with full feature access, success metrics, and a deployment readiness report.",
    estimatedFarms: 30,
    setupDays: 3,
    featuresIncluded: ["All Core Features", "Onboarding Support", "Success Dashboard", "Readiness Report"],
    requirements: ["30 farms with GPS data", "1 designated coordinator"],
    usedBy: 22,
  },
];

export function getDeploymentTemplates(): DeploymentTemplate[] {
  return DEPLOYMENT_TEMPLATES;
}

export function getDeploymentTemplate(id: string): DeploymentTemplate | undefined {
  return DEPLOYMENT_TEMPLATES.find((t) => t.id === id);
}

const PILOT_DATA: Array<{ name: string; region: string; partner: string; target: number }> = [
  { name: "Punjab Wheat Belt Pilot",       region: "Ludhiana, Punjab",         partner: "Krishi Vikas Foundation",    target: 150 },
  { name: "Maharashtra Cotton Cluster",    region: "Nagpur, Maharashtra",       partner: "TechFarm Solutions",         target: 80 },
  { name: "Rajasthan Dryland Initiative",  region: "Barmer, Rajasthan",         partner: "Rajasthan Agri Cooperative", target: 60 },
  { name: "Karnataka Maize Program",       region: "Dharwad, Karnataka",        partner: "Karnataka State FPO",        target: 120 },
];

export function getPilotRollouts(): PilotRollout[] {
  const now = new Date();
  return PILOT_DATA.map((p, i) => {
    const seed = seedHash(`pilot-${i}`);
    const activeFarms = Math.round(sf(seed, p.target * 0.4, p.target * 0.95));
    const progressPct = Math.round((activeFarms / p.target) * 100);
    const daysAgo = Math.round(sf(seed + 1, 10, 90));
    const startDate = new Date(now.getTime() - daysAgo * 86400000).toISOString().split("T")[0];
    const targetDaysLeft = Math.round(sf(seed + 2, 20, 60));
    const targetDate = new Date(now.getTime() + targetDaysLeft * 86400000).toISOString().split("T")[0];

    const milestoneLabels = ["Org setup", "Boundary import", "First scan", "50% farms active", "Audit complete"];
    const milestonesDone = Math.round(sf(seed + 3, 1, 4));

    return {
      id: `PLT-${(seed % 9999).toString().padStart(4, "0")}`,
      name: p.name,
      region: p.region,
      partnerOrg: p.partner,
      targetFarms: p.target,
      activeFarms,
      startDate,
      targetDate,
      progressPct,
      status: progressPct >= 95 ? "completed" : progressPct > 0 ? "active" : "planning",
      milestones: milestoneLabels.map((label, mi) => ({
        label,
        achieved: mi < milestonesDone,
        date: new Date(now.getTime() - (milestonesDone - mi) * 7 * 86400000).toISOString().split("T")[0],
      })),
    };
  });
}

export function getTemplateTypeConfig(type: DeploymentTemplateType): { color: string; bg: string; border: string } {
  const configs: Record<DeploymentTemplateType, { color: string; bg: string; border: string }> = {
    district:   { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
    state:      { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    ngo:        { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
    enterprise: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    pilot:      { color: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/20" },
  };
  return configs[type];
}
