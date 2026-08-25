"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/redeem", label: "Kode Redeem" },
  { href: "/admin/broadcast", label: "Broadcast" },
  { href: "/admin/pengaturan", label: "Pengaturan" }
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-black/5 dark:border-white/10 pb-px">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`px-3.5 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
            pathname === t.href
              ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500"
              : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
          }`}
        >
          {t.label}
        </Link>
      ))}
      <button
        onClick={logout}
        className="ml-auto px-3.5 py-2 text-sm font-medium text-red-500 hover:underline whitespace-nowrap"
      >
        Logout
      </button>
    </div>
  );
}
