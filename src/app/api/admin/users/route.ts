import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb, COLLECTIONS } from "@/lib/firebase";
import type { UserRole } from "@/types";

function db() { return getFirebaseDb(); }

export async function GET(): Promise<NextResponse> {
  try {
    const q = query(
      collection(db(), COLLECTIONS.USER_PROFILES),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snap = await getDocs(q);
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    return NextResponse.json(users);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const { uid, role }: { uid: string; role: UserRole } = await req.json();
    if (!uid || !role) return NextResponse.json({ error: "uid and role required" }, { status: 400 });
    const validRoles: UserRole[] = ["farmer", "auditor", "org_manager", "admin"];
    if (!validRoles.includes(role))
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    await updateDoc(doc(db(), COLLECTIONS.USER_PROFILES, uid), { role });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
