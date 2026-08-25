import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/session";

export async function POST(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const enabled = Boolean(body?.enabled);

  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: "maintenance_mode", value: enabled ? "true" : "false" }, { onConflict: "key" });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, enabled });
}
