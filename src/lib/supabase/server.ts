import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

type SupabaseServerClientOptions = {
  accessToken?: string;
};

export function getSupabaseServerClient(options: SupabaseServerClientOptions = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: options.accessToken
      ? {
          headers: {
            Authorization: `Bearer ${options.accessToken}`,
          },
        }
      : undefined,
  });
}
