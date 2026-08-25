import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, announcements: data });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = (body?.title as string | undefined)?.trim();
  const message = (body?.message as string | undefined)?.trim();

  if (!title || !message) {
    return NextResponse.json({ ok: false, error: "Judul dan pesan wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .insert({ title, message, is_active: true })
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, announcement: data });
}
