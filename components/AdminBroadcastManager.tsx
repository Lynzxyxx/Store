"use client";

import { useEffect, useState } from "react";
import { Loader } from "./Icons";

type Announcement = { id: string; title: string; message: string; created_at: string };

export default function AdminBroadcastManager() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/broadcast", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setList(data.announcements);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message })
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setError(data.error || "Gagal mengirim broadcast");
    } else {
      setTitle("");
      setMessage("");
      setSuccess(true);
      load();
    }
    setSubmitting(false);
  }

  return (
    <div className="grid md:grid-cols-[320px,1fr] gap-6">
      <form onSubmit={handleSubmit} className="card rounded-2xl p-5 space-y-3 h-fit">
        <h2 className="font-semibold text-sm mb-1">Kirim Broadcast</h2>
        <p className="text-xs text-black/40 dark:text-white/40">
          Pesan akan muncul sebagai popup ke semua pengunjung situs.
        </p>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul"
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Isi pesan"
          rows={4}
          className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-green-600 dark:text-green-400">Broadcast terkirim!</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {submitting && <Loader size={16} />}
          Kirim
        </button>
      </form>

      <div className="card rounded-2xl divide-y divide-black/5 dark:divide-white/10">
        {loading ? (
          <div className="p-6 flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
            <Loader size={16} /> Memuat...
          </div>
        ) : list.length === 0 ? (
          <p className="p-6 text-sm text-black/40 dark:text-white/40">Belum ada broadcast.</p>
        ) : (
          list.map((a) => (
            <div key={a.id} className="p-4">
              <p className="font-medium text-sm">{a.title}</p>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">{a.message}</p>
              <p className="text-[11px] text-black/30 dark:text-white/30 mt-2">
                {new Date(a.created_at).toLocaleString("id-ID")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
