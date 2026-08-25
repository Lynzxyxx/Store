import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, orders: data });
}
