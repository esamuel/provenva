// app/api/checkout/business/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createCheckoutSession } from '@/lib/paddle'

const PRICE_MAP: Record<string, string> = {
  starter: process.env.PADDLE_PRICE_BUSINESS_STARTER!,
  pro: process.env.PADDLE_PRICE_BUSINESS_PRO!,
  scale: process.env.PADDLE_PRICE_BUSINESS_SCALE!,
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  if (!PRICE_MAP[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('stripe_customer_id')
    .eq('clerk_user_id', userId)
    .single()

  const session = await createCheckoutSession({
    priceId: PRICE_MAP[plan],
    customerId: business?.stripe_customer_id ?? undefined,
    metadata: { clerk_user_id: userId, plan },
  })

  return NextResponse.json({ url: session.url })
}
