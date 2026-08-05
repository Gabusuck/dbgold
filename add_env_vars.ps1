cd "c:\Users\gabin\Desktop\DB Gold Site"

Write-Host "Adding environment variables to Vercel..." -ForegroundColor Green

# Adicionar NEXT_PUBLIC_SUPABASE_URL (não sensitive, production, preview, development)
Write-Host "`n1. Adding NEXT_PUBLIC_SUPABASE_URL..."
"n`nhttps://yplqgqwqllbpxpbnohwo.supabase.co`n1`n2`n3" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL

# Adicionar NEXT_PUBLIC_SUPABASE_ANON_KEY (não sensitive, production, preview, development)
Write-Host "`n2. Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
"n`nsb_publishable_h5Ik0xp8q808Z6YAR5QgnA_F6dcToI5`n1`n2`n3" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Adicionar SUPABASE_SERVICE_ROLE_KEY (sensitive, production only)
Write-Host "`n3. Adding SUPABASE_SERVICE_ROLE_KEY..."
"y`nsb_secret_87d_wQZncS6tFx9s-YTf5g_8kQLLfr7`n1" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY

Write-Host "`nDone! Environment variables added successfully." -ForegroundColor Green
