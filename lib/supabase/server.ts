import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente de leitura pública (usa a chave anon).
 * Respeita as políticas de RLS — a tabela gold_settings tem leitura pública.
 */
export function createReadClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
}

/**
 * Cliente administrativo (usa a service role key).
 * Ignora RLS — usar APENAS no servidor para escritas protegidas por password.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey!,
    { auth: { persistSession: false } },
  )
}
