import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Tidak throw di build time (Vercel build tidak selalu punya env),
  // tapi kasih warning jelas di console saat runtime.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabaseClient] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum di-set."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
