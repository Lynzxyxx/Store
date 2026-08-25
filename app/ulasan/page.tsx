import ReviewForm from "@/components/ReviewForm";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Review } from "@/lib/types";
import { WhatsApp } from "@/components/Icons";

export const dynamic = "force-dynamic";

async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return [];
  return data as Review[];
}

export default async function UlasanPage() {
  const reviews = await getReviews();

  return (
    <div className="py-10 animate-fadeIn space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Ulasan Pelanggan</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Punya kendala atau pertanyaan?{" "}
          <a
            href="https://wa.me/6283169147017"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 font-medium inline-flex items-center gap-1 hover:underline"
          >
            <WhatsApp size={14} /> Chat CS di WhatsApp
          </a>
        </p>
      </div>

      <ReviewForm />

      <div className="space-y-3 max-w-lg mx-auto">
        {reviews.length === 0 ? (
          <p className="text-sm text-black/40 dark:text-white/40 text-center">Belum ada ulasan.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{r.name}</p>
                <span className="text-amber-500 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60">{r.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
