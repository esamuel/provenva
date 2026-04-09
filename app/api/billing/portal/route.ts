// app/api/billing/portal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createPortalSession } from '@/lib/paddle'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  // Check businesses first
  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('stripe_customer_id')
    .eq('clerk_user_id', userId)
    .single()

  // Then VAs
  const { data: va } = await supabaseAdmin
    .from('vas')
    .select('stripe_customer_id')
    .eq('clerk_user_id', userId)
    .single()

  const customerId = business?.stripe_customer_id ?? va?.stripe_customer_id

  if (!customerId) {
    return NextResponse.redirect(new URL('/dashboard/business', req.url))
  }

  const session = await createPortalSession(customerId)

  return NextResponse.redirect(session.url)
}
