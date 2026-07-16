import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente de leitura pública (usa a chave anon).
 * Respeita as políticas de RLS — a tabela gold_settings tem leitura pública.
 */
export function createReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('[INIT] createReadClient:', {
    url: url ? 'SET' : 'MISSING',
    key: key ? `SET (${key.substring(0, 10)}...)` : 'MISSING',
  })

  if (!url || !key) {
    console.error('[INIT] Supabase env vars missing!')
  }

  return createSupabaseClient(url!, key!, { auth: { persistSession: false } })
}

/**
 * Cliente administrativo (usa a service role key).
 * Ignora RLS — usar APENAS no servidor para escritas protegidas por password.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const key = serviceKey ?? anonKey

  console.log('[INIT] createAdminClient:', {
    url: url ? 'SET' : 'MISSING',
    serviceKey: serviceKey ? `SET (${serviceKey.substring(0, 10)}...)` : 'NOT SET',
    anonKeyFallback: !serviceKey && anonKey ? 'FALLBACK' : 'N/A',
  })

  if (!url || !key) {
    console.error('[INIT] Supabase env vars missing!')
  }

  return createSupabaseClient(url!, key!, { auth: { persistSession: false } })
}
