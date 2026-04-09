// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()

// Client-side (uses anon key, respects RLS)
export const supabase = createClient(url, anon)

// Server-side (uses service role, bypasses RLS — use only in API routes)
export const supabaseAdmin = createClient(
  url,
  serviceRole
)
