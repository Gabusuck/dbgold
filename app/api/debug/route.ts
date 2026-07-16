import { NextResponse } from 'next/server'
import { createReadClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const debug = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ MISSING',
    },
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
  }

  // Test read client
  try {
    const supabase = createReadClient()
    const { data, error } = await supabase
      .from('gold_settings')
      .select('id')
      .limit(1)

    debug.supabaseReadTest = {
      success: !error,
      error: error?.message || 'No error',
      hasData: !!data,
    }
  } catch (e) {
    debug.supabaseReadTest = {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }

  return NextResponse.json(debug)
}
