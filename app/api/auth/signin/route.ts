import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createUserSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = (body?.username as string | undefined)?.trim();
  const password = body?.password as string | undefined;

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Username dan password wajib diisi" }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "Gagal login: " + error.message }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ ok: false, error: "Username atau password salah" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Username atau password salah" }, { status: 401 });
  }

  createUserSession(user.id, user.username);
  return NextResponse.json({ ok: true, user: { id: user.id, username: user.username } });
}
