import "server-only";
import { createClient } from "@supabase/supabase-js";

// FILE INI HANYA BOLEH DIIMPORT DARI Route Handler / Server Component.
// Jangan pernah import file ini dari komponen "use client".
const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabaseAdmin] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set di environment server."
  );
}

export const supabaseAdmin = createClient(supabaseUrl ?? "", serviceRoleKey ?? "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
