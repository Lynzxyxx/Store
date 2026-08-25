"use client";

import { useEffect, useState } from "react";
import { Loader, Check } from "./Icons";

type HistoryItem = {
  id: string;
  redeemed_at: string;
  redeem_codes: { code: string } | null;
  products: { name: string } | null;
};

export default function RedeemForm({ username }: { username: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function loadHistory() {
    try {
      const res = await fetch("/api/redeem", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setHistory(data.history ?? []);
    } catch {
      // diamkan
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage({ type: "error", text: data.error || "Gagal redeem kode" });
      } else {
        setMessage({ type: "success", text: data.message || "Berhasil!" });
        setCode("");
        loadHistory();
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card rounded-2xl p-6">
        <h1 className="text-lg font-semibold mb-1">Redeem Kode</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mb-5">Masuk sebagai {username}</p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Masukkan kode redeem"
            className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 text-sm flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading && <Loader size={16} />}
            Redeem
          </button>
        </form>

        {message && (
          <p className={`text-sm mt-3 flex items-center gap-1.5 ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
            {message.type === "success" && <Check size={14} />}
            {message.text}
          </p>
        )}
      </div>

      <div className="card rounded-2xl p-6">
        <h2 className="font-semibold text-sm mb-4">Riwayat Redeem</h2>
        {history.length === 0 ? (
          <p className="text-sm text-black/40 dark:text-white/40">Belum ada riwayat redeem.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm border-b border-black/5 dark:border-white/10 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-mono font-medium">{h.redeem_codes?.code ?? "-"}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">{h.products?.name ?? "Umum"}</p>
                </div>
                <span className="text-xs text-black/40 dark:text-white/40">
                  {new Date(h.redeemed_at).toLocaleDateString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
