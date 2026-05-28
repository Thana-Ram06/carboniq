"use server";

import {
  collection, addDoc, getDocs, query, where, orderBy,
  limit, serverTimestamp, updateDoc, doc,
} from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import type { PilotOrganization, FieldCampaign, PilotStatus, CampaignStatus } from "@/types";

function db() { return getFirebaseDb(); }

export async function createPilotOrg(
  input: Omit<PilotOrganization, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTIONS.PILOT_ORGS), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPilotOrgs(createdBy?: string): Promise<PilotOrganization[]> {
  const constraints: Parameters<typeof query>[1][] = [
    orderBy("createdAt", "desc"),
    limit(50),
  ];
  if (createdBy) constraints.unshift(where("createdBy", "==", createdBy));
  const q = query(collection(db(), COLLECTIONS.PILOT_ORGS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PilotOrganization);
}

export async function updatePilotStatus(
  orgId: string,
  status: PilotStatus
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.PILOT_ORGS, orgId), { status });
}

export async function createFieldCampaign(
  input: Omit<FieldCampaign, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTIONS.FIELD_CAMPAIGNS), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCampaignsByOrg(orgId: string): Promise<FieldCampaign[]> {
  const q = query(
    collection(db(), COLLECTIONS.FIELD_CAMPAIGNS),
    where("orgId", "==", orgId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FieldCampaign);
}

export async function updateCampaignStatus(
  campaignId: string,
  status: CampaignStatus,
  completedFarms?: number
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (completedFarms !== undefined) update.completedFarms = completedFarms;
  await updateDoc(doc(db(), COLLECTIONS.FIELD_CAMPAIGNS, campaignId), update);
}

export async function getAllCampaigns(): Promise<FieldCampaign[]> {
  const q = query(
    collection(db(), COLLECTIONS.FIELD_CAMPAIGNS),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FieldCampaign);
}
