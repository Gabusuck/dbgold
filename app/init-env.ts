'use server'

// Forçar variáveis de ambiente como fallback quando não estão no Vercel
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yplqgqwqllbpxpbnohwo.supabase.co'
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_h5Ik0xp8q808Z6YAR5QgnA_F6dcToI5'
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_87d_wQZncS6tFx9s-YTf5g_8kQLLfr7'
}

console.log('[ENV INIT] Supabase env vars initialized')

export {}
