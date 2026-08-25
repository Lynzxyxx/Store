"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "./Icons";

export default function ReviewForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, message })
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Gagal mengirim ulasan");
        setLoading(false);
        return;
      }

      setDone(true);
      setName("");
      setMessage("");
      setRating(5);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card rounded-2xl p-6 max-w-lg mx-auto space-y-3">
      <h2 className="font-semibold text-sm">Tulis Ulasan</h2>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama kamu"
        className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setRating(n)}
            className={`text-xl ${n <= rating ? "text-amber-500" : "text-black/20 dark:text-white/20"}`}
            aria-label={`Rating ${n}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Bagaimana pengalaman kamu belanja di RYUU-STORE?"
        rows={3}
        className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {done && <p className="text-sm text-green-600 dark:text-green-400">Terima kasih atas ulasannya!</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 text-sm flex items-center gap-2 transition-colors disabled:opacity-60"
      >
        {loading && <Loader size={16} />}
        Kirim Ulasan
      </button>
    </form>
  );
}
