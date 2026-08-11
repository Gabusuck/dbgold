'use server'

// Forçar variáveis de ambiente como fallback quando não estão no Vercel
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yplqgqwqllbpxpbnohwo.supabase.co'
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_h5Ik0xp8q808Z6YAR5QgnA_F6dcToI5'
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwbHFncXdxbGxicHhwYm5vaHdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM3MzczNiwiZXhwIjoyMDk4OTQ5NzM2fQ.wKnHaw95k6iiU9L6HTMQ1o6rynRamCAU6nRJxpE232s'
}

console.log('[ENV INIT] Supabase env vars initialized')

export {}
