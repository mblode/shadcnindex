import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE ??
    process.env.SUPABASE_SECRET_KEY;

  if (!(supabaseUrl && supabaseServiceKey)) {
    throw new Error(
      "Missing SUPABASE_URL or a service role key (SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE/SUPABASE_SECRET_KEY)."
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });

  return cachedClient;
}
