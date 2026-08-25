import Link from "next/link";
import type { Product } from "@/lib/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/checkout/${product.id}`}
      className="card group rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900 dark:to-black/20 grid place-items-center overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-brand-500/50">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-4">
        {product.category && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-brand-500 mb-1 inline-block">
            {product.category}
          </span>
        )}
        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-black/50 dark:text-white/50 line-clamp-2 mb-2">{product.description}</p>
        )}
        <p className="font-bold text-brand-600 dark:text-brand-400">{formatRupiah(product.price)}</p>
      </div>
    </Link>
  );
}
