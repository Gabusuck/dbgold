import { NextResponse } from 'next/server'
import { createReadClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createReadClient()
    const { data, error } = await supabase
      .from('gold_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('[API /settings] Supabase error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    if (!data) return NextResponse.json({ ok: false, error: 'no data' }, { status: 404 })

    return NextResponse.json({
      ok: true,
      settings: {
        price_per_gram_24k: Number(data.price_per_gram_24k ?? 0),
        discount_per_gram: Number(data.discount_per_gram ?? 0),
        price_per_gram_silver_999: Number(data.price_per_gram_silver_999 ?? 0),
        discount_per_gram_silver: Number(data.discount_per_gram_silver ?? 0),
        updated_at: data.updated_at ?? new Date().toISOString(),
      }
    })
  } catch (e) {
    console.error('[API /settings] Exception:', e)
    return NextResponse.json({ ok: false, error: 'exception' }, { status: 500 })
  }
}
