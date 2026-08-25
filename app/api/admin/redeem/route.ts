import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/session";
import crypto from "crypto";

function generateCode(): string {
  return crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 karakter
}

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("redeem_codes")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, codes: data });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const product_id = (body?.product_id as string | undefined) || null;
  const quota = Number(body?.quota ?? 1);

  if (!quota || quota < 1) {
    return NextResponse.json({ ok: false, error: "Quota minimal 1" }, { status: 400 });
  }

  const code = (body?.custom_code as string | undefined)?.trim().toUpperCase() || generateCode();

  const { data, error } = await supabaseAdmin
    .from("redeem_codes")
    .insert({ code, product_id, quota, used_count: 0, is_active: true })
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, redeemCode: data });
}
