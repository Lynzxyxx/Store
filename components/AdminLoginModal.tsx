"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader } from "./Icons";

export default function AdminLoginModal({ onClose }: { onClose: () => void }) {
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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }
      onClose();
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="card w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold text-xl mb-4">
          R
        </div>
        <h2 className="text-lg font-semibold mb-1">Login Admin</h2>
        <p className="text-sm text-black/50 dark:text-white/50 mb-5">Khusus untuk pengelola RYUU-STORE.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username admin"
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading && <Loader size={16} />}
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
