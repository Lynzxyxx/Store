import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyWebhookSignature } from "@/lib/buatqris";

/**
 * Webhook buatqris.site akan POST ke sini setiap ada perubahan status transaksi.
 * Body diasumsikan berisi reference_id (= trx_id kita) dan status.
 * Karena struktur payload upstream bisa bervariasi, mapping field dibuat
 * fleksibel (mengecek beberapa kemungkinan nama field).
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || req.headers.get("x-webhook-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Body bukan JSON valid" }, { status: 400 });
  }

  const trxId: string | undefined =
    payload.reference_id || payload.trx_id || payload.ref_id || payload.order_id;
  const rawStatus: string = String(payload.status || payload.transaction_status || "").toLowerCase();

  if (!trxId) {
    return NextResponse.json({ ok: false, error: "reference_id tidak ada di payload" }, { status: 400 });
  }

  const status =
    ["paid", "success", "settlement"].includes(rawStatus)
      ? "success"
      : ["expired", "expire"].includes(rawStatus)
      ? "expired"
      : ["failed", "failure", "cancel", "cancelled"].includes(rawStatus)
      ? "failed"
      : null;

  if (!status) {
    // Status belum final / tidak dikenal — abaikan tapi tetap balas 200 agar upstream tidak retry terus.
    return NextResponse.json({ ok: true, message: "Status diabaikan (belum final)" });
  }

  const { data: order, error: findErr } = await supabaseAdmin
    .from("orders")
    .select("id, status")
    .eq("trx_id", trxId)
    .maybeSingle();

  if (findErr) return NextResponse.json({ ok: false, error: findErr.message }, { status: 500 });
  if (!order) return NextResponse.json({ ok: false, error: "Order tidak ditemukan" }, { status: 404 });

  // Idempoten: jangan overwrite status final yang sudah tercatat.
  if (order.status === "success" || order.status === "expired" || order.status === "failed") {
    return NextResponse.json({ ok: true, message: "Order sudah final sebelumnya" });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", order.id);

  if (updateErr) return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
