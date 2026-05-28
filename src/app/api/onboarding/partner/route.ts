"use server";
import { NextRequest, NextResponse } from "next/server";
import { getPartnerOrgs, getOnboardingFlow } from "@/lib/onboarding/partner-onboarding";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");

  if (orgId) {
    return NextResponse.json(getOnboardingFlow(orgId));
  }

  return NextResponse.json({ partners: getPartnerOrgs(), total: getPartnerOrgs().length });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { orgName, type, state, contactEmail, contactName } = body as {
    orgName?: string; type?: string; state?: string; contactEmail?: string; contactName?: string;
  };

  if (!orgName || !contactEmail) {
    return NextResponse.json({ error: "orgName and contactEmail are required" }, { status: 400 });
  }

  return NextResponse.json({
    orgId: `ORG-NEW-${Date.now()}`,
    orgName,
    type: type ?? "ngo",
    state: state ?? "Unknown",
    contactEmail,
    contactName: contactName ?? "Unknown",
    status: "onboarding",
    onboardingProgress: 0,
    message: "Organisation created. Onboarding flow initiated.",
    createdAt: new Date().toISOString(),
  }, { status: 201 });
}
