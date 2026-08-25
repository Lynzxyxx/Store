import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/session";

export async function GET() {
  const session = getUserSession();
  if (!session) return NextResponse.json({ ok: true, user: null });
  return NextResponse.json({ ok: true, user: { id: session.uid, username: session.username } });
}
