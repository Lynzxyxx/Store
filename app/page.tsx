import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) return [];
  return data as Product[];
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="animate-fadeIn">
      <section className="py-14 sm:py-20 text-center">
        <span className="inline-block text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40 rounded-full px-3 py-1 mb-4">
          Suntik Sosmed #1 Terpercaya
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          Naikkan Followers, Likes & Views
          <br />
          <span className="text-brand-500">Instan & Otomatis</span>
        </h1>
        <p className="text-black/60 dark:text-white/60 max-w-lg mx-auto mb-8">
          Layanan top up sosial media dengan proses otomatis, pembayaran QRIS real-time, dan support 24 jam.
        </p>
        <Link
          href="/produk"
          className="inline-block rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 shadow-lg shadow-brand-500/30 transition-colors"
        >
          Lihat Semua Produk
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Produk Populer</h2>
          <Link href="/produk" className="text-sm text-brand-500 font-medium hover:underline">
            Lihat semua →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-black/50 dark:text-white/50 text-center py-12">
            Belum ada produk aktif. Admin bisa menambahkannya lewat panel admin.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
