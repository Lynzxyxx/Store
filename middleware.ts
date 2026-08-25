import { NextRequest, NextResponse } from "next/server";

const BYPASS_PREFIXES = ["/maintenance", "/admin", "/api", "/_next", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin yang sedang login tidak boleh ikut ke-block maintenance.
  const adminCookie = req.cookies.get("ryuu_admin_session");
  if (adminCookie) return NextResponse.next();

  try {
    const url = new URL("/api/settings/maintenance", req.url);
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (data?.enabled) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
  } catch {
    // Jika gagal cek (misal Supabase down), jangan block seluruh situs — fail-open.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
