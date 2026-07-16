'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createReadClient, createAdminClient } from '@/lib/supabase/server'
import type { GoldSettings } from '@/lib/gold'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'dbgold2026'

const DEFAULT_SETTINGS: GoldSettings = {
  price_per_gram_24k: 0,
  discount_per_gram: 0,
  price_per_gram_silver_999: 0,
  discount_per_gram_silver: 0,
  updated_at: new Date().toISOString(),
}

export type PriceHistoryEntry = {
  timestamp: string
  price_gold: number
  price_silver: number
  trend_gold: 'up' | 'down' | 'same'
  trend_silver: 'up' | 'down' | 'same'
}

const DEFAULT_HISTORY: PriceHistoryEntry[] = []

/* ─────────────────────────────────────────
   GET PRICE HISTORY (Hybrid: Supabase + Cookie Fallback)
   ───────────────────────────────────────── */
export async function getPriceHistory(): Promise<PriceHistoryEntry[]> {
  // Purge the old history cookie once as requested by the user
  try {
    const cookieStore = await cookies()
    cookieStore.delete('price_history_v3')
  } catch (e) {}

  // Check if Supabase is configured
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  if (!hasSupabaseConfig) {
    console.warn('[WARN] Supabase not configured, returning empty history')
    return DEFAULT_HISTORY
  }

  // Try loading from Supabase
  try {
    console.log('[SUPABASE] Attempting to read price history...')
    const supabase = createReadClient()
    const { data, error } = await supabase
      .from('price_history')
      .select('timestamp, price_gold, price_silver, trend_gold, trend_silver')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('[SUPABASE] History query error:', error.message, error.code)
      return DEFAULT_HISTORY
    }

    if (!data || data.length === 0) {
      console.warn('[SUPABASE] No price history data found')
      return DEFAULT_HISTORY
    }

    const history = data.map((row) => ({
      timestamp: row.timestamp,
      price_gold: Number(row.price_gold),
      price_silver: Number(row.price_silver),
      trend_gold: row.trend_gold as 'up' | 'down' | 'same',
      trend_silver: row.trend_silver as 'up' | 'down' | 'same',
    }))

    console.log('[SUPABASE] Successfully loaded', history.length, 'price history entries')
    return history
  } catch (e) {
    console.error('[SUPABASE] Exception:', e instanceof Error ? e.message : String(e))
  }

  return DEFAULT_HISTORY
}

/* ─────────────────────────────────────────
   GET SETTINGS (Hybrid: Supabase + Cookie Fallback)
   ───────────────────────────────────────── */
export async function getSettings(): Promise<GoldSettings> {
  let currentSettings = { ...DEFAULT_SETTINGS }
  // Check if Supabase is configured
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  console.log('[DEBUG] Supabase configured:', hasSupabaseConfig)
  if (!hasSupabaseConfig) {
    console.warn('[WARN] Supabase environment variables not set! Falling back to local cookie if present')
    // Try cookie fallback when Supabase is not configured
    try {
      const cookieStore = await cookies()
      const localCookie = cookieStore.get('gold_settings_local')?.value
      if (localCookie) {
        const parsed = JSON.parse(localCookie)
        if (parsed.price_per_gram_24k != null) currentSettings.price_per_gram_24k = Number(parsed.price_per_gram_24k)
        if (parsed.discount_per_gram != null) currentSettings.discount_per_gram = Number(parsed.discount_per_gram)
        if (parsed.price_per_gram_silver_999 != null) currentSettings.price_per_gram_silver_999 = Number(parsed.price_per_gram_silver_999)
        if (parsed.discount_per_gram_silver != null) currentSettings.discount_per_gram_silver = Number(parsed.discount_per_gram_silver)
        if (parsed.updated_at != null) currentSettings.updated_at = parsed.updated_at
        console.log('[COOKIE] Loaded settings from cookie (fallback):', currentSettings)
        return currentSettings
      }
    } catch (e) {
      console.error('Error reading local settings cookie:', e)
    }
    return currentSettings
  }

  // Try loading from Supabase (preferred source of truth)
  try {
    console.log('[SUPABASE] Attempting to read settings (preferred) ...')
    const supabase = createReadClient()
    const { data, error } = await supabase
      .from('gold_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('[SUPABASE] Query error:', error.message, error.code)
      // If query fails, fall back to cookie if present
      try {
        const cookieStore = await cookies()
        const localCookie = cookieStore.get('gold_settings_local')?.value
        if (localCookie) {
          const parsed = JSON.parse(localCookie)
          if (parsed.price_per_gram_24k != null) currentSettings.price_per_gram_24k = Number(parsed.price_per_gram_24k)
          if (parsed.discount_per_gram != null) currentSettings.discount_per_gram = Number(parsed.discount_per_gram)
          if (parsed.price_per_gram_silver_999 != null) currentSettings.price_per_gram_silver_999 = Number(parsed.price_per_gram_silver_999)
          if (parsed.discount_per_gram_silver != null) currentSettings.discount_per_gram_silver = Number(parsed.discount_per_gram_silver)
          if (parsed.updated_at != null) currentSettings.updated_at = parsed.updated_at
          console.log('[COOKIE] Loaded settings from cookie after Supabase error:', currentSettings)
          return currentSettings
        }
      } catch (e) {
        console.error('Error reading local settings cookie:', e)
      }
      return currentSettings
    }

    if (!data) {
      console.warn('[SUPABASE] No data returned from gold_settings table')
      return currentSettings
    }

    currentSettings.price_per_gram_24k = Number(data.price_per_gram_24k)
    currentSettings.discount_per_gram = Number(data.discount_per_gram)
    currentSettings.updated_at = data.updated_at || currentSettings.updated_at

    if (data.price_per_gram_silver_999 != null) {
      currentSettings.price_per_gram_silver_999 = Number(data.price_per_gram_silver_999)
    }
    if (data.discount_per_gram_silver != null) {
      currentSettings.discount_per_gram_silver = Number(data.discount_per_gram_silver)
    }

    console.log('[SUPABASE] Successfully loaded settings:', currentSettings)
  } catch (e) {
    console.error('[SUPABASE] Exception:', e instanceof Error ? e.message : String(e))
    // On exception, try cookie fallback
    try {
      const cookieStore = await cookies()
      const localCookie = cookieStore.get('gold_settings_local')?.value
      if (localCookie) {
        const parsed = JSON.parse(localCookie)
        if (parsed.price_per_gram_24k != null) currentSettings.price_per_gram_24k = Number(parsed.price_per_gram_24k)
        if (parsed.discount_per_gram != null) currentSettings.discount_per_gram = Number(parsed.discount_per_gram)
        if (parsed.price_per_gram_silver_999 != null) currentSettings.price_per_gram_silver_999 = Number(parsed.price_per_gram_silver_999)
        if (parsed.discount_per_gram_silver != null) currentSettings.discount_per_gram_silver = Number(parsed.discount_per_gram_silver)
        if (parsed.updated_at != null) currentSettings.updated_at = parsed.updated_at
        console.log('[COOKIE] Loaded settings from cookie after Supabase exception:', currentSettings)
        return currentSettings
      }
    } catch (e) {
      console.error('Error reading local settings cookie:', e)
    }
  }

  return currentSettings
}

/* ─────────────────────────────────────────
   UPDATE SETTINGS (Hybrid with automatic fallback)
   ───────────────────────────────────────── */
type UpdateResult = { ok: boolean; message: string }

export async function updateSettings(input: {
  password: string
  price_per_gram_24k: number
  discount_per_gram: number
  price_per_gram_silver_999: number
  discount_per_gram_silver: number
}): Promise<UpdateResult> {
  if (input.password !== ADMIN_PASSWORD) {
    return { ok: false, message: 'Password incorreta.' }
  }

  const price = Number(input.price_per_gram_24k)
  const discount = Number(input.discount_per_gram)
  const priceSilver = Number(input.price_per_gram_silver_999)
  const discountSilver = Number(input.discount_per_gram_silver)

  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, message: 'O preço do ouro tem de ser maior que zero.' }
  }
  if (!Number.isFinite(discount)) {
    return { ok: false, message: 'O desconto do ouro tem de ser um número válido.' }
  }
  if (!Number.isFinite(priceSilver) || priceSilver <= 0) {
    return { ok: false, message: 'O preço da prata tem de ser maior que zero.' }
  }
  if (!Number.isFinite(discountSilver)) {
    return { ok: false, message: 'O desconto da prata tem de ser um número válido.' }
  }

  // Calculate trends locally first
  let historyList: PriceHistoryEntry[] = []
  try {
    historyList = await getPriceHistory()
  } catch {}

  const prevEntry = historyList[0]
  const trend_gold = prevEntry
    ? (price > prevEntry.price_gold ? 'up' : (price < prevEntry.price_gold ? 'down' : 'same'))
    : 'same'
  const trend_silver = prevEntry
    ? (priceSilver > prevEntry.price_silver ? 'up' : (priceSilver < prevEntry.price_silver ? 'down' : 'same'))
    : 'same'

  const timestamp = new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
  }) + ' ' + new Date().toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const newEntry: PriceHistoryEntry = {
    timestamp,
    price_gold: price,
    price_silver: priceSilver,
    trend_gold,
    trend_silver,
  }

  const updatedHistory = [newEntry, ...historyList].slice(0, 10)

  // 1. Save to cookies immediately as a guarantee
  try {
    const cookieStore = await cookies()
    cookieStore.set('price_history_v3', JSON.stringify(updatedHistory), {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
    cookieStore.set('gold_settings_local', JSON.stringify({
      price_per_gram_24k: price,
      discount_per_gram: discount,
      price_per_gram_silver_999: priceSilver,
      discount_per_gram_silver: discountSilver,
      updated_at: new Date().toISOString(),
    }), {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  } catch (e) {
    console.error('Error writing fallback cookies:', e)
  }

  // 2. Try to sync to Supabase in background
  try {
    const supabase = createAdminClient()
    
    // Save to history table
    await supabase.from('price_history').insert({
      timestamp,
      price_gold: price,
      price_silver: priceSilver,
      trend_gold,
      trend_silver,
    })

    // Keep history capped at 10
    const { data: allHistory } = await supabase
      .from('price_history')
      .select('id')
      .order('created_at', { ascending: false })

    if (allHistory && allHistory.length > 10) {
      const idsToDelete = allHistory.slice(10).map((row) => row.id)
      await supabase.from('price_history').delete().in('id', idsToDelete)
    }

    // Update settings table
    const { error: dbError } = await supabase
      .from('gold_settings')
      .update({
        price_per_gram_24k: price,
        discount_per_gram: discount,
        price_per_gram_silver_999: priceSilver,
        discount_per_gram_silver: discountSilver,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)

    if (!dbError) {
      // If Supabase update succeeded, we can clear the local settings override cookie
      // so we use the database as the single source of truth.
      try {
        const cookieStore = await cookies()
        cookieStore.delete('gold_settings_local')
      } catch {}
      revalidatePath('/')
      return { ok: true, message: 'Valores guardados na base de dados com sucesso.' }
    } else {
      console.warn('Supabase DB error, using cookie fallback:', dbError)
    }
  } catch (e) {
    console.warn('Supabase service unavailable, using cookie fallback:', e)
  }

  revalidatePath('/')
  return { ok: true, message: 'Valores atualizados com sucesso (modo local ativo).' }
}

export async function verifyPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD
}
