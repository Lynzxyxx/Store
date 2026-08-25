import { getUserSession } from "@/lib/session";
import RedeemForm from "@/components/RedeemForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function RedeemPage() {
  const session = getUserSession();

  if (!session) {
    return (
      <div className="py-16 text-center animate-fadeIn">
        <h1 className="text-xl font-semibold mb-2">Masuk untuk Redeem Kode</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mb-6">
          Fitur redeem kode hanya tersedia untuk pengguna yang sudah login (mode tamu tidak bisa redeem).
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/signin" className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 transition-colors">
            Masuk
          </Link>
          <Link href="/signup" className="rounded-xl border border-black/10 dark:border-white/10 text-sm font-medium px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            Daftar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-14 animate-fadeIn">
      <RedeemForm username={session.username} />
    </div>
  );
}
