import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as Product[];
}

export default async function ProdukPage() {
  const products = await getProducts();

  return (
    <div className="py-10 animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-6">Semua Produk</h1>
      {products.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50 text-center py-12">Belum ada produk tersedia.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
