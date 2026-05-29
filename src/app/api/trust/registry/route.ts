import { NextResponse } from "next/server";
import { getVerificationRecords, getTransparencyLogs, getConfidenceCertifications, getVerificationSummary } from "@/lib/trust/verification-registry";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "summary";
  if (mode === "records") return NextResponse.json(getVerificationRecords(Number(searchParams.get("limit") ?? 12)));
  if (mode === "logs") return NextResponse.json(getTransparencyLogs(Number(searchParams.get("limit") ?? 20)));
  if (mode === "certifications") return NextResponse.json(getConfidenceCertifications());
  return NextResponse.json(getVerificationSummary());
}
