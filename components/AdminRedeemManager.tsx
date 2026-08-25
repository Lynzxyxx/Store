"use client";

import { useEffect, useState } from "react";
import { Loader } from "./Icons";

type RedeemCode = {
  id: string;
  code: string;
  quota: number;
  used_count: number;
  is_active: boolean;
  products: { name: string } | null;
};

export default function AdminRedeemManager() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState("1");
  const [customCode, setCustomCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/redeem", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setCodes(data.codes);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quota: Number(quota), custom_code: customCode || undefined })
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setError(data.error || "Gagal membuat kode");
    } else {
      setCustomCode("");
      setQuota("1");
      load();
    }
    setSubmitting(false);
  }

  async function toggle(c: RedeemCode) {
    await fetch(`/api/admin/redeem/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active })
    });
    load();
  }

  async function remove(c: RedeemCode) {
    if (!confirm(`Hapus kode "${c.code}"?`)) return;
    await fetch(`/api/admin/redeem/${c.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid md:grid-cols-[280px,1fr] gap-6">
      <form onSubmit={handleCreate} className="card rounded-2xl p-5 space-y-3 h-fit">
        <h2 className="font-semibold text-sm mb-1">Buat Kode Redeem</h2>
        <input
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
          placeholder="Kode custom (opsional, auto jika kosong)"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 font-mono"
        />
        <input
          required
          type="number"
          min={1}
          value={quota}
          onChange={(e) => setQuota(e.target.value)}
          placeholder="Kuota penggunaan"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {submitting && <Loader size={16} />}
          Buat Kode
        </button>
      </form>

      <div className="card rounded-2xl divide-y divide-black/5 dark:divide-white/10">
        {loading ? (
          <div className="p-6 flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
            <Loader size={16} /> Memuat...
          </div>
        ) : codes.length === 0 ? (
          <p className="p-6 text-sm text-black/40 dark:text-white/40">Belum ada kode redeem.</p>
        ) : (
          codes.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono font-medium text-sm">{c.code}</p>
                <p className="text-xs text-black/40 dark:text-white/40">
                  Terpakai {c.used_count}/{c.quota}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggle(c)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                    c.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : "bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50"
                  }`}
                >
                  {c.is_active ? "Aktif" : "Nonaktif"}
                </button>
                <button
                  onClick={() => remove(c)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
