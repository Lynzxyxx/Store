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
  if (username.length < 3) {
    return NextResponse.json({ ok: false, error: "Username minimal 3 karakter" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password minimal 8 karakter" }, { status: 400 });
  }

  const { data: existing, error: findErr } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (findErr) {
    return NextResponse.json({ ok: false, error: "Gagal memeriksa username: " + findErr.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ ok: false, error: "Username sudah dipakai" }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: created, error: insertErr } = await supabaseAdmin
    .from("users")
    .insert({ username, password_hash })
    .select("id, username")
    .single();

  if (insertErr || !created) {
    return NextResponse.json(
      { ok: false, error: "Gagal membuat akun: " + (insertErr?.message ?? "unknown") },
      { status: 500 }
    );
  }

  createUserSession(created.id, created.username);
  return NextResponse.json({ ok: true, user: { id: created.id, username: created.username } });
}
