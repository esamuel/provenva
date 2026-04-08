// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import type Stripe from 'stripe'

// Disable body parsing — Stripe needs the raw body to verify signature
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[webhook] signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const session    = event.data.object as Stripe.Checkout.Session
  const sub        = event.data.object as Stripe.Subscription
  const clerkId    = (session.metadata?.clerk_user_id ?? sub.metadata?.clerk_user_id) as string
  const plan       = session.metadata?.plan as string | undefined
  const type       = session.metadata?.type as string | undefined

  switch (event.type) {

    // ── New subscription created ──────────────────────────────
    case 'checkout.session.completed': {
      if (!clerkId) break

      if (type === 'va_badge') {
        // VA paid for verified badge
        await supabaseAdmin
          .from('vas')
          .update({
            is_premium:            true,
            stripe_customer_id:    session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('clerk_user_id', clerkId)

      } else if (plan) {
        // Business subscribed to a plan
        await supabaseAdmin
          .from('businesses')
          .update({
            plan,
            subscription_status:   'active',
            stripe_customer_id:    session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('clerk_user_id', clerkId)
      }
      break
    }

    // ── Subscription renewed (keep status active) ─────────────
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const subId   = invoice.subscription as string
      if (!subId) break

      // Update business
      await supabaseAdmin
        .from('businesses')
        .update({ subscription_status: 'active' })
        .eq('stripe_subscription_id', subId)

      // Update VA
      await supabaseAdmin
        .from('vas')
        .update({ is_premium: true })
        .eq('stripe_subscription_id', subId)
      break
    }

    // ── Payment failed ────────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId   = invoice.subscription as string
      if (!subId) break

      await supabaseAdmin
        .from('businesses')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_subscription_id', subId)
      break
    }

    // ── Subscription cancelled ────────────────────────────────
    case 'customer.subscription.deleted': {
      const subId = sub.id
      if (!subId) break

      await supabaseAdmin
        .from('businesses')
        .update({ plan: null, subscription_status: 'canceled' })
        .eq('stripe_subscription_id', subId)

      await supabaseAdmin
        .from('vas')
        .update({ is_premium: false })
        .eq('stripe_subscription_id', subId)
      break
    }

    default:
      console.log(`[webhook] unhandled event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
