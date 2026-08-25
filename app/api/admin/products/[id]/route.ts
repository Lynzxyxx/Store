import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const allowed = ["name", "price", "description", "category", "image_url", "is_active"] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "Tidak ada field untuk diupdate" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, product: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
