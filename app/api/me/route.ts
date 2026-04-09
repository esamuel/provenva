// app/api/me/route.ts — lightweight role hint for client nav
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminUserId } from '@/lib/admin'

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ business: false, va: false, admin: false })
  }

  const [{ data: business }, { data: va }] = await Promise.all([
    supabaseAdmin.from('businesses').select('id').eq('clerk_user_id', userId).maybeSingle(),
    supabaseAdmin.from('vas').select('id').eq('clerk_user_id', userId).maybeSingle(),
  ])

  return NextResponse.json({
    business: !!business,
    va:       !!va,
    admin:    isAdminUserId(userId),
  })
}
