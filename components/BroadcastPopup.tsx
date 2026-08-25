"use client";

import { useEffect, useState } from "react";
import { X } from "./Icons";

type Announcement = { id: string; title: string; message: string };

export default function BroadcastPopup() {
  const [ann, setAnn] = useState<Announcement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/announcements/latest", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.announcement || cancelled) return;

        const seenKey = "ryuu-seen-announcement";
        const lastSeen = localStorage.getItem(seenKey);
        if (lastSeen === data.announcement.id) return;

        setAnn(data.announcement);
      } catch {
        // Diam-diam gagal — broadcast bukan fitur kritikal, jangan ganggu UX utama.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function close() {
    if (ann) localStorage.setItem("ryuu-seen-announcement", ann.id);
    setAnn(null);
  }

  if (!ann) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="card w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 grid place-items-center mb-4">
          📢
        </div>
        <h3 className="font-semibold text-base mb-2">{ann.title}</h3>
        <p className="text-sm text-black/70 dark:text-white/70 whitespace-pre-line">{ann.message}</p>
        <button
          onClick={close}
          className="mt-5 w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 text-sm transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
