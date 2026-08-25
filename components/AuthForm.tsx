"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "./Icons";

export default function AuthForm({ mode }: { mode: "signup" | "signin" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Terjadi kesalahan");
        setLoading(false);
        return;
      }

      router.push("/redeem");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
      setLoading(false);
    }
  }

  return (
    <div className="card rounded-2xl p-6 max-w-sm mx-auto">
      <h1 className="text-lg font-semibold mb-1">{mode === "signup" ? "Daftar Akun" : "Masuk Akun"}</h1>
      <p className="text-sm text-black/50 dark:text-white/50 mb-5">
        {mode === "signup" ? "Buat akun untuk bisa redeem kode & lacak riwayat." : "Masuk untuk melanjutkan."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 8 karakter)"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {loading && <Loader size={16} />}
          {mode === "signup" ? "Daftar" : "Masuk"}
        </button>
      </form>

      <p className="text-xs text-center text-black/40 dark:text-white/40 mt-4">
        {mode === "signup" ? (
          <>
            Sudah punya akun?{" "}
            <a href="/signin" className="text-brand-500 hover:underline">
              Masuk
            </a>
          </>
        ) : (
          <>
            Belum punya akun?{" "}
            <a href="/signup" className="text-brand-500 hover:underline">
              Daftar
            </a>
          </>
        )}
      </p>
    </div>
  );
}
