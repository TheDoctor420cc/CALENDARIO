import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function createClient() {
  // En v0, usamos directamente @supabase/supabase-js
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
