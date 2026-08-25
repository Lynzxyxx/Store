import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createQris } from "@/lib/buatqris";
import { getUserSession, generateTrxId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const product_id = body?.product_id as string | undefined;
  const target = (body?.target as string | undefined)?.trim();

  if (!product_id || !target) {
    return NextResponse.json({ ok: false, error: "Produk dan target wajib diisi" }, { status: 400 });
  }

  const { data: product, error: prodErr } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", product_id)
    .eq("is_active", true)
    .maybeSingle();

  if (prodErr) return NextResponse.json({ ok: false, error: prodErr.message }, { status: 500 });
  if (!product) return NextResponse.json({ ok: false, error: "Produk tidak ditemukan atau tidak aktif" }, { status: 404 });

  const session = getUserSession();
  let trxId = generateTrxId();

  // Pastikan trx_id unik (retry maksimal 5x jika bentrok — sangat jarang terjadi karena 8 digit acak)
  for (let i = 0; i < 5; i++) {
    const { data: exists } = await supabaseAdmin.from("orders").select("id").eq("trx_id", trxId).maybeSingle();
    if (!exists) break;
    trxId = generateTrxId();
  }

  const qrisResult = await createQris({ amount: product.price, trxId, note: `RYUU-STORE ${product.name}` });

  if (!qrisResult.ok) {
    return NextResponse.json({ ok: false, error: qrisResult.error || "Gagal membuat QRIS" }, { status: 502 });
  }

  const { data: order, error: insertErr } = await supabaseAdmin
    .from("orders")
    .insert({
      trx_id: trxId,
      user_id: session?.uid ?? null,
      product_id: product.id,
      target,
      amount: product.price,
      status: "pending",
      qris_string: qrisResult.qrisString ?? null,
      qris_ref: qrisResult.ref ?? trxId
    })
    .select("*")
    .single();

  if (insertErr || !order) {
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan order: " + (insertErr?.message ?? "unknown") },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    order,
    qrisString: qrisResult.qrisString,
    qrImageUrl: qrisResult.qrImageUrl
  });
}
