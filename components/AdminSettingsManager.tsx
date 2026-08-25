"use client";

import { useEffect, useState } from "react";
import { Loader } from "./Icons";

export default function AdminSettingsManager() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/maintenance", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setEnabled(d.enabled);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggle() {
    setSaving(true);
    const next = !enabled;
    const res = await fetch("/api/admin/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next })
    });
    const data = await res.json();
    if (data.ok) setEnabled(next);
    setSaving(false);
  }

  return (
    <div className="card rounded-2xl p-6 max-w-md">
      <h2 className="font-semibold text-sm mb-1">Mode Maintenance</h2>
      <p className="text-xs text-black/40 dark:text-white/40 mb-4">
        Jika aktif, semua pengunjung (kecuali admin yang sedang login) akan diarahkan ke halaman
        maintenance.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
          <Loader size={16} /> Memuat...
        </div>
      ) : (
        <button
          onClick={toggle}
          disabled={saving}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:opacity-60 ${
            enabled
              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
          }`}
        >
          {saving && <Loader size={16} />}
          Maintenance saat ini: {enabled ? "AKTIF" : "NONAKTIF"} — klik untuk{" "}
          {enabled ? "menonaktifkan" : "mengaktifkan"}
        </button>
      )}
    </div>
  );
}
