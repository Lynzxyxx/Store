"use client";

import { useEffect, useRef, useState } from "react";
import type { Product, Order } from "@/lib/types";
import { Loader, Check, Copy, WhatsApp } from "./Icons";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

type Step = "form" | "generating" | "waiting" | "success" | "failed";

export default function CheckoutForm({ product }: { product: Product }) {
  const [target, setTarget] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [qrisString, setQrisString] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/qris/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, target: target.trim() })
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Gagal membuat QRIS");
        setStep("form");
        return;
      }

      setOrder(data.order);
      setQrisString(data.qrisString ?? null);
      setQrImageUrl(data.qrImageUrl ?? null);
      setStep("waiting");
      startPolling(data.order.trx_id);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setStep("form");
    }
  }

  function startPolling(trxId: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/qris/status?trx_id=${encodeURIComponent(trxId)}`, { cache: "no-store" });
        const data = await res.json();
        if (!data.ok) return;

        if (data.status === "success") {
          setStep("success");
          setOrder(data.order);
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === "expired" || data.status === "failed") {
          setStep("failed");
          setOrder(data.order);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Diamkan — polling akan coba lagi di interval berikutnya.
      }
    }, 4000);
  }

  function copyQris() {
    if (!qrisString) return;
    navigator.clipboard.writeText(qrisString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const qrImgSrc =
    qrImageUrl ||
    (qrisString
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrisString)}`
      : null);

  return (
    <div className="card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-black/5 dark:border-white/10">
        <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900 grid place-items-center font-bold text-brand-600 dark:text-brand-400">
          {product.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="font-semibold text-base">{product.name}</h1>
          <p className="text-brand-600 dark:text-brand-400 font-bold text-sm">{formatRupiah(product.price)}</p>
        </div>
      </div>

      {step === "form" && (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Target (username / link)</label>
            <input
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="contoh: @username_instagram"
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 text-sm transition-colors"
          >
            Buat Pembayaran QRIS
          </button>
        </form>
      )}

      {step === "generating" && (
        <div className="py-10 flex flex-col items-center gap-3 text-sm text-black/60 dark:text-white/60">
          <Loader size={28} className="text-brand-500" />
          Membuat QRIS...
        </div>
      )}

      {step === "waiting" && order && (
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <p className="text-xs text-black/50 dark:text-white/50">
            ID Transaksi: <span className="font-mono font-semibold">{order.trx_id}</span>
          </p>
          {qrImgSrc && (
            <div className="p-3 bg-white rounded-xl border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImgSrc} alt="QRIS Payment" width={240} height={240} />
            </div>
          )}
          {qrisString && (
            <button
              onClick={copyQris}
              className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Tersalin!" : "Salin kode QRIS"}
            </button>
          )}
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <Loader size={16} />
            Menunggu pembayaran...
          </div>
          <p className="text-xs text-black/40 dark:text-white/40 text-center">
            Halaman ini otomatis memperbarui status setiap beberapa detik. Jangan tutup halaman ini sampai
            pembayaran selesai.
          </p>
        </div>
      )}

      {step === "success" && order && (
        <div className="flex flex-col items-center gap-3 py-6 animate-fadeIn text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 grid place-items-center">
            <Check size={26} />
          </div>
          <h2 className="font-semibold text-lg">Pembayaran Berhasil!</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Pesanan <span className="font-mono">{order.trx_id}</span> sedang diproses otomatis.
          </p>
          <a
            href="https://wa.me/6283169147017"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
          >
            <WhatsApp size={16} />
            Hubungi CS jika ada kendala
          </a>
        </div>
      )}

      {step === "failed" && order && (
        <div className="flex flex-col items-center gap-3 py-6 animate-fadeIn text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 grid place-items-center font-bold text-xl">
            !
          </div>
          <h2 className="font-semibold text-lg">
            {order.status === "expired" ? "QRIS Kedaluwarsa" : "Pembayaran Gagal"}
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60">Silakan coba buat pesanan baru.</p>
          <button
            onClick={() => {
              setStep("form");
              setOrder(null);
              setQrisString(null);
              setQrImageUrl(null);
            }}
            className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}
