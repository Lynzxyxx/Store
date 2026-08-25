import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = body?.username as string | undefined;
  const password = body?.password as string | undefined;

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Username dan password wajib diisi" }, { status: 400 });
  }

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_USERNAME / ADMIN_PASSWORD belum di-set di environment server." },
      { status: 500 }
    );
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Username atau password salah" }, { status: 401 });
  }

  createAdminSession(username);
  return NextResponse.json({ ok: true });
}
