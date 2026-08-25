"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { Loader } from "./Icons";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "", image_url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setProducts(data.products);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) })
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setError(data.error || "Gagal menambah produk");
    } else {
      setForm({ name: "", price: "", description: "", category: "", image_url: "" });
      load();
    }
    setSubmitting(false);
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !p.is_active })
    });
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid md:grid-cols-[280px,1fr] gap-6">
      <form onSubmit={handleAdd} className="card rounded-2xl p-5 space-y-3 h-fit">
        <h2 className="font-semibold text-sm mb-1">Tambah Produk</h2>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nama produk"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          required
          type="number"
          min={1}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Harga (Rp)"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Kategori (opsional)"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Deskripsi (opsional)"
          rows={2}
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <input
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          placeholder="URL gambar (opsional)"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {submitting && <Loader size={16} />}
          Tambah Produk
        </button>
      </form>

      <div className="card rounded-2xl divide-y divide-black/5 dark:divide-white/10">
        {loading ? (
          <div className="p-6 flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
            <Loader size={16} /> Memuat produk...
          </div>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-black/40 dark:text-white/40">Belum ada produk.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-black/40 dark:text-white/40">{formatRupiah(p.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(p)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                    p.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : "bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50"
                  }`}
                >
                  {p.is_active ? "Aktif" : "Nonaktif"}
                </button>
                <button
                  onClick={() => remove(p)}
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
