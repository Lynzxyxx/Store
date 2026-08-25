import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getQrisStatus } from "@/lib/buatqris";

export async function GET(req: NextRequest) {
  const trxId = req.nextUrl.searchParams.get("trx_id");
  if (!trxId) return NextResponse.json({ ok: false, error: "trx_id wajib diisi" }, { status: 400 });

  const { data: order, error } = await supabaseAdmin.from("orders").select("*").eq("trx_id", trxId).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!order) return NextResponse.json({ ok: false, error: "Order tidak ditemukan" }, { status: 404 });

  // Jika sudah final (paid/expired/failed/success), langsung kembalikan tanpa hit API luar.
  if (order.status !== "pending") {
    return NextResponse.json({ ok: true, status: order.status, order });
  }

  // Fallback aktif: polling ke upstream buatqris.site (selain menunggu webhook).
  const result = await getQrisStatus(order.qris_ref || order.trx_id);
  if (result.ok && result.status && result.status !== "pending") {
    const newStatus = result.status === "paid" ? "success" : result.status;
    const { data: updated } = await supabaseAdmin
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .select("*")
      .single();

    return NextResponse.json({ ok: true, status: newStatus, order: updated ?? order });
  }

  return NextResponse.json({ ok: true, status: "pending", order });
}
