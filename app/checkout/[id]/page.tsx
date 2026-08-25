import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Product } from "@/lib/types";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Product;
}

export default async function CheckoutPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product || !product.is_active) notFound();

  return (
    <div className="py-10 max-w-lg mx-auto animate-fadeIn">
      <CheckoutForm product={product} />
    </div>
  );
}
