// app/api/checkout/va/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createBusinessCheckout } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const { data: va } = await supabaseAdmin
    .from('vas')
    .select('stripe_customer_id, status')
    .eq('clerk_user_id', userId)
    .single()

  if (!va || va.status !== 'verified') {
    return NextResponse.redirect(new URL('/dashboard/va', req.url))
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await createBusinessCheckout({
    priceId:    process.env.STRIPE_PRICE_VA_VERIFIED!,
    customerId: va?.stripe_customer_id ?? undefined,
    successUrl: `${appUrl}/dashboard/va?badge=1`,
    cancelUrl:  `${appUrl}/dashboard/va`,
    metadata:   { clerk_user_id: userId, type: 'va_badge' },
  })

  return NextResponse.redirect(session.url!)
}
