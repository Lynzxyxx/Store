"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import AdminLoginModal from "./AdminLoginModal";
import { Moon, Sun } from "./Icons";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-black/40 border-b border-black/5 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold text-lg shadow-md shadow-brand-500/30">
              R
            </span>
            <span className="font-semibold text-lg tracking-tight">
              RYUU<span className="text-brand-500">-STORE</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-black/70 dark:text-white/70">
            <Link href="/" className="hover:text-brand-500 transition-colors">
              Beranda
            </Link>
            <Link href="/produk" className="hover:text-brand-500 transition-colors">
              Produk
            </Link>
            <Link href="/redeem" className="hover:text-brand-500 transition-colors">
              Redeem
            </Link>
            <Link href="/ulasan" className="hover:text-brand-500 transition-colors">
              Ulasan
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle tema"
              className="w-10 h-10 rounded-full grid place-items-center border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setShowAdmin(true)}
              title="Login Admin"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold shadow-md shadow-brand-500/30 active:scale-95 transition-transform"
            >
              R
            </button>
          </div>
        </div>
      </header>

      {showAdmin && <AdminLoginModal onClose={() => setShowAdmin(false)} />}
    </>
  );
}
