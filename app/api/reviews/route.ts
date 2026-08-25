import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, reviews: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = (body?.name as string | undefined)?.trim();
  const message = (body?.message as string | undefined)?.trim();
  const rating = Number(body?.rating ?? 5);

  if (!name || !message) {
    return NextResponse.json({ ok: false, error: "Nama dan ulasan wajib diisi" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, error: "Rating harus 1-5" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert({ name, message, rating })
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, review: data });
}
