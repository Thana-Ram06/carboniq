import type { InstitutionalPartner, InstitutionalWorkspace } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export function getInstitutionalPartners(): InstitutionalPartner[] {
  const partners = [
    { id: "IP-001", name: "Ministry of Agriculture & Farmers Welfare", type: "government" as const, state: null, role: "Policy oversight and farm data sharing mandate", govLevel: "governing_body" as const, joined: "2024-01-15", contact: { name: "Shri Ramesh Gupta", email: "ramesh.gupta@dacfw.gov.in" } },
    { id: "IP-002", name: "ICAR – National Remote Sensing Centre", type: "research" as const, state: null, role: "Satellite data pipeline and NDVI validation partner", govLevel: "validator" as const, joined: "2024-03-01", contact: { name: "Dr. S. Pattnaik", email: "spattnaik@nrsc.gov.in" } },
    { id: "IP-003", name: "Maharashtra State Agriculture Dept.", type: "government" as const, state: "Maharashtra", role: "State-level farmer onboarding and field auditor coordination", govLevel: "contributor" as const, joined: "2024-04-10", contact: { name: "Shri A. Kulkarni", email: "akulkarni@mahaagri.gov.in" } },
    { id: "IP-004", name: "World Bank India Office", type: "multilateral" as const, state: null, role: "Climate finance mobilisation and carbon credit offtake", govLevel: "observer" as const, joined: "2024-06-20", contact: { name: "Ms. Priya Menon", email: "pmenon@worldbank.org" } },
    { id: "IP-005", name: "NABARD Climate Finance Division", type: "finance" as const, state: null, role: "Concessional lending to verified carbon credit holders", govLevel: "contributor" as const, joined: "2024-07-05", contact: { name: "Dr. K. Iyer", email: "kiyer@nabard.org" } },
    { id: "IP-006", name: "Watershed Organisation Trust (WOTR)", type: "ngo" as const, state: "Maharashtra", role: "Grassroots farmer mobilisation and field evidence collection", govLevel: "contributor" as const, joined: "2024-08-15", contact: { name: "Dr. Crispino Lobo", email: "clobo@wotr.org" } },
    { id: "IP-007", name: "Punjab Remote Sensing Centre", type: "research" as const, state: "Punjab", role: "State calibration datasets and wheat NDVI validation", govLevel: "validator" as const, joined: "2024-10-01", contact: { name: "Dr. R. Sidhu", email: "rsidhu@prsc.gov.in" } },
    { id: "IP-008", name: "UNDP Accelerator Lab India", type: "multilateral" as const, state: null, role: "Technology innovation and ecosystem scaling support", govLevel: "observer" as const, joined: "2025-01-10", contact: { name: "Ms. Anjali Singh", email: "anjali.singh@undp.org" } },
  ];

  return partners.map((p, i) => {
    const seed = seedHash(p.id);
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      country: "India",
      state: p.state,
      role: p.role,
      joinedAt: p.joined,
      farmsOverseen: Math.floor(sf(seed, 80, 1800)),
      workspacesActive: Math.floor(sf(seed + 1, 1, 5)),
      governanceLevel: p.govLevel,
      contactName: p.contact.name,
      contactEmail: p.contact.email,
    };
  });
}

export function getInstitutionalWorkspaces(): InstitutionalWorkspace[] {
  const partners = getInstitutionalPartners();
  const stateGroups = [
    ["Maharashtra", "Gujarat"], ["Maharashtra", "Punjab", "MP"], ["Maharashtra"],
    ["All India"], ["All India"], ["Maharashtra", "Telangana"],
    ["Punjab", "Haryana"], ["All India"],
  ];
  return partners.map((p, i) => {
    const seed = seedHash(`ws-${p.id}`);
    return {
      id: `WS-${String(i + 1).padStart(3, "0")}`,
      partnerId: p.id,
      partnerName: p.name,
      workspaceName: `${p.name.split(" ").slice(0, 2).join(" ")} – VASUDHA Portal`,
      states: stateGroups[i] ?? ["All India"],
      farmsManaged: p.farmsOverseen,
      activeUsers: Math.floor(sf(seed, 2, 28)),
      lastActivityAt: new Date(Date.now() - Math.floor(sf(seed + 1, 0, 14 * 86400000))).toISOString(),
      dataAccessLevel: (p.governanceLevel === "governing_body" ? "admin" : p.governanceLevel === "validator" ? "read_write" : "read_only") as InstitutionalWorkspace["dataAccessLevel"],
      reportsGenerated: Math.floor(sf(seed + 2, 5, 85)),
    };
  });
}

export function getInstitutionalSummary() {
  const partners = getInstitutionalPartners();
  return {
    totalPartners: partners.length,
    governingBodies: partners.filter((p) => p.governanceLevel === "governing_body").length,
    validators: partners.filter((p) => p.governanceLevel === "validator").length,
    contributors: partners.filter((p) => p.governanceLevel === "contributor").length,
    observers: partners.filter((p) => p.governanceLevel === "observer").length,
    govPartners: partners.filter((p) => p.type === "government").length,
    researchPartners: partners.filter((p) => p.type === "research").length,
    totalFarmsOverseen: partners.reduce((a, p) => a + p.farmsOverseen, 0),
  };
}
