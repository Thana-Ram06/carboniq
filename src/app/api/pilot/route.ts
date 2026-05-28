import { NextResponse } from "next/server";
import { collection, getDocs, addDoc, query, orderBy, limit, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import type { PilotOrganization, FieldCampaign } from "@/types";

function db() { return getFirebaseDb(); }

export async function GET(): Promise<NextResponse> {
  try {
    const [pilotsSnap, campaignsSnap] = await Promise.all([
      getDocs(query(collection(db(), COLLECTIONS.PILOT_ORGS), orderBy("createdAt", "desc"), limit(50))),
      getDocs(query(collection(db(), COLLECTIONS.FIELD_CAMPAIGNS), orderBy("createdAt", "desc"), limit(100))),
    ]);
    const pilots = pilotsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as PilotOrganization);
    const campaigns = campaignsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as FieldCampaign);
    return NextResponse.json({ pilots, campaigns });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    if (body.type === "pilot") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type1, ...data } = body;
      const ref = await addDoc(collection(db(), COLLECTIONS.PILOT_ORGS), {
        ...data,
        farmCount: 0,
        farmerCount: 0,
        status: "onboarding",
        createdAt: serverTimestamp(),
      });
      return NextResponse.json({ id: ref.id });
    }
    if (body.type === "campaign") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type2, ...data } = body;
      const ref = await addDoc(collection(db(), COLLECTIONS.FIELD_CAMPAIGNS), {
        ...data,
        completedFarms: 0,
        status: "planned",
        createdAt: serverTimestamp(),
      });
      return NextResponse.json({ id: ref.id });
    }
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const { id, collection: col, ...update }: { id: string; collection: string; [key: string]: unknown } = await req.json();
    const colName = col === "pilot" ? COLLECTIONS.PILOT_ORGS : COLLECTIONS.FIELD_CAMPAIGNS;
    await updateDoc(doc(db(), colName, id), update as Record<string, unknown>);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
