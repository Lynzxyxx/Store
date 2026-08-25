import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { data, error } = await supabaseAdmin
    .from("redeem_codes")
    .update({ is_active: Boolean(body?.is_active) })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, redeemCode: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin.from("redeem_codes").delete().eq("id", params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
