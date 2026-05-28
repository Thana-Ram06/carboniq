"use server";
import { NextRequest, NextResponse } from "next/server";
import { getSampleAPIKeys, createAPIKey } from "@/lib/api-keys/key-manager";
import type { APIKeyScope } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? "demo-user";
  const keys = getSampleAPIKeys(userId);
  return NextResponse.json({ keys, total: keys.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, userId, scopes, tier, expiresInDays } = body as {
    name?: string;
    userId?: string;
    scopes?: APIKeyScope[];
    tier?: "starter" | "professional" | "enterprise";
    expiresInDays?: number;
  };

  if (!name || !userId) {
    return NextResponse.json({ error: "name and userId are required" }, { status: 400 });
  }

  const result = createAPIKey({
    name,
    userId,
    scopes: scopes ?? ["read:farms", "read:ndvi"],
    tier: tier ?? "professional",
    expiresInDays,
  });

  const { rawKey, ...key } = result;
  return NextResponse.json({ key, rawKey, warning: "Store this key securely — it will not be shown again." }, { status: 201 });
}
