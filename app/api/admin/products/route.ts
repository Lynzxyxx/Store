import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, products: data });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = body?.name as string | undefined;
  const price = Number(body?.price);
  const description = (body?.description as string | undefined) ?? null;
  const category = (body?.category as string | undefined) ?? null;
  const image_url = (body?.image_url as string | undefined) ?? null;

  if (!name || !price || Number.isNaN(price) || price <= 0) {
    return NextResponse.json({ ok: false, error: "Nama dan harga produk wajib valid" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({ name, price, description, category, image_url, is_active: true })
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, product: data });
}
