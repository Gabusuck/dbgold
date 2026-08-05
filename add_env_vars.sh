#!/bin/bash

# Script para adicionar environment variables ao Vercel

echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "n" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL https://yplqgqwqllbpxpbnohwo.supabase.co production preview development

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "n" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY sb_publishable_h5Ik0xp8q808Z6YAR5QgnA_F6dcToI5 production preview development

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
echo "y" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY sb_secret_87d_wQZncS6tFx9s-YTf5g_8kQLLfr7 production

echo "Done!"
