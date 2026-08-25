import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserSession } from "@/lib/session";

export async function GET() {
  const session = getUserSession();
  if (!session) return NextResponse.json({ ok: true, history: [] });

  const { data, error } = await supabaseAdmin
    .from("redeem_history")
    .select("*, redeem_codes(code), products(name)")
    .eq("user_id", session.uid)
    .order("redeemed_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, history: data });
}

export async function POST(req: NextRequest) {
  const session = getUserSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Silakan login terlebih dahulu untuk redeem kode" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code = (body?.code as string | undefined)?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ ok: false, error: "Kode redeem wajib diisi" }, { status: 400 });
  }

  const { data: redeemCode, error: findErr } = await supabaseAdmin
    .from("redeem_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (findErr) return NextResponse.json({ ok: false, error: findErr.message }, { status: 500 });
  if (!redeemCode) return NextResponse.json({ ok: false, error: "Kode tidak ditemukan" }, { status: 404 });
  if (!redeemCode.is_active) return NextResponse.json({ ok: false, error: "Kode sudah tidak aktif" }, { status: 400 });
  if (redeemCode.used_count >= redeemCode.quota) {
    return NextResponse.json({ ok: false, error: "Kuota kode ini sudah habis" }, { status: 400 });
  }

  // Cegah user redeem kode yang sama dua kali
  const { data: already } = await supabaseAdmin
    .from("redeem_history")
    .select("id")
    .eq("redeem_code_id", redeemCode.id)
    .eq("user_id", session.uid)
    .maybeSingle();

  if (already) {
    return NextResponse.json({ ok: false, error: "Kamu sudah pernah redeem kode ini" }, { status: 400 });
  }

  const { error: historyErr } = await supabaseAdmin.from("redeem_history").insert({
    redeem_code_id: redeemCode.id,
    user_id: session.uid,
    product_id: redeemCode.product_id
  });
  if (historyErr) return NextResponse.json({ ok: false, error: historyErr.message }, { status: 500 });

  const { error: updateErr } = await supabaseAdmin
    .from("redeem_codes")
    .update({ used_count: redeemCode.used_count + 1 })
    .eq("id", redeemCode.id);
  if (updateErr) return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, message: "Kode berhasil di-redeem!" });
}
