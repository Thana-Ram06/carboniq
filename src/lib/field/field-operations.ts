import type { FieldSOP, AuditorAssignment } from "@/types";

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sf(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export const FIELD_SOPS: FieldSOP[] = [
  {
    id: "SOP-EVD-001",
    title: "Field Evidence Collection Protocol",
    category: "evidence_collection",
    version: "v2.3",
    lastRevised: "2025-01-15",
    estimatedMinutes: 45,
    steps: [
      { step: 1, instruction: "Confirm farm identity by checking GPS coordinates against registered boundary", required: true },
      { step: 2, instruction: "Photograph crop canopy from 4 cardinal directions at 1.5m height", required: true },
      { step: 3, instruction: "Record crop growth stage, visible stress indicators, and pest/disease signs", required: true },
      { step: 4, instruction: "Collect soil sample from 3 random points within farm boundary (0–30cm depth)", required: false },
      { step: 5, instruction: "Upload all photos and notes via VASUDHA mobile app while on-site", required: true },
      { step: 6, instruction: "Get farmer signature on evidence collection form (digital or physical)", required: true },
    ],
  },
  {
    id: "SOP-BND-001",
    title: "GPS Boundary Survey Protocol",
    category: "boundary_survey",
    version: "v1.8",
    lastRevised: "2024-11-20",
    estimatedMinutes: 30,
    steps: [
      { step: 1, instruction: "Enable high-accuracy GPS mode on device and wait for <5m accuracy reading", required: true },
      { step: 2, instruction: "Walk the farm perimeter at normal pace, recording a waypoint every 5–10 metres", required: true },
      { step: 3, instruction: "Close the polygon by returning within 10m of the starting point", required: true },
      { step: 4, instruction: "Review auto-calculated area; if >10% deviation from declared area, resurvey", required: true },
      { step: 5, instruction: "Sync boundary data to VASUDHA platform before leaving the farm", required: true },
    ],
  },
  {
    id: "SOP-AUD-001",
    title: "Remote Audit Review Procedure",
    category: "audit_review",
    version: "v3.1",
    lastRevised: "2025-02-08",
    estimatedMinutes: 90,
    steps: [
      { step: 1, instruction: "Download the farm evidence package from VASUDHA Audit Portal", required: true },
      { step: 2, instruction: "Cross-check satellite NDVI against field evidence dates — flag >15-day gaps", required: true },
      { step: 3, instruction: "Verify farm boundary area against land records (±10% tolerance)", required: true },
      { step: 4, instruction: "Review carbon calculation inputs: crop type, yield, residue management", required: true },
      { step: 5, instruction: "Score evidence completeness (0–100); reject if <60", required: true },
      { step: 6, instruction: "Issue audit verdict: Approved, Conditional, or Rejected with written rationale", required: true },
      { step: 7, instruction: "Submit audit record to VASUDHA platform — triggers automatic farmer notification", required: true },
    ],
  },
  {
    id: "SOP-CROP-001",
    title: "Crop Assessment & Yield Estimation",
    category: "crop_assessment",
    version: "v1.4",
    lastRevised: "2025-03-01",
    estimatedMinutes: 60,
    steps: [
      { step: 1, instruction: "Identify dominant and secondary crop species across the farm plot", required: true },
      { step: 2, instruction: "Estimate crop growth stage using BBCH scale (0–99)", required: true },
      { step: 3, instruction: "Conduct 3 crop-cut samples (1m² each) at random positions for yield estimation", required: false },
      { step: 4, instruction: "Record visible signs of drought, flooding, or pest pressure with photos", required: true },
      { step: 5, instruction: "Compare observed biomass to ICAR baseline for the crop-state combination", required: false },
    ],
  },
];

const AUDITORS: Array<{ name: string; email: string; region: string }> = [
  { name: "Dr. Priya Nair",       email: "priya.nair@vasudha.in",     region: "Punjab & Haryana" },
  { name: "Rahul Verma",          email: "rahul.verma@vasudha.in",    region: "UP & MP" },
  { name: "Smita Patil",          email: "smita.patil@vasudha.in",    region: "Maharashtra & Gujarat" },
  { name: "Arvind Kumar",         email: "arvind.kumar@vasudha.in",   region: "Karnataka & AP" },
  { name: "Deepa Rajasekharan",   email: "deepa.r@vasudha.in",        region: "Tamil Nadu & Kerala" },
  { name: "Mohan Lal",            email: "mohan.lal@vasudha.in",      region: "Rajasthan & Gujarat" },
];

export function getAuditorAssignments(): AuditorAssignment[] {
  const now = new Date();
  return AUDITORS.map((a, i) => {
    const seed = seedHash(`auditor-${i}`);
    const assigned = Math.round(sf(seed, 12, 84));
    const completed = Math.round(sf(seed + 1, assigned * 0.4, assigned * 0.9));
    const overloaded = assigned > 60;
    return {
      id: `AUD-${(i + 1).toString().padStart(3, "0")}`,
      auditorName: a.name,
      auditorEmail: a.email,
      region: a.region,
      assignedFarms: assigned,
      completedAudits: completed,
      pendingAudits: assigned - completed,
      avgCompletionDays: parseFloat(sf(seed + 2, 2.4, 7.8).toFixed(1)),
      status: overloaded ? "overloaded" : seed % 8 === 0 ? "on_leave" : "active",
      nextDeadline: new Date(now.getTime() + Math.round(sf(seed + 3, 1, 14)) * 86400000).toISOString().split("T")[0],
    };
  });
}
