import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-center px-4">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-brand-500">404</h1>
        <p className="text-black/60 dark:text-white/60 mb-6">Halaman tidak ditemukan.</p>
        <Link href="/" className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
