import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPaddleWebhookSignature } from '@/lib/paddle'

type PaddleWebhookEvent = {
  event_type?: string
  data?: Record<string, unknown>
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function extractCustomData(data: Record<string, unknown>): Record<string, unknown> {
  return asRecord(data.custom_data) ?? {}
}

async function markBusinessBySubscription(
  subscriptionId: string,
  values: Record<string, unknown>,
) {
  await supabaseAdmin
    .from('businesses')
    .update(values)
    .eq('stripe_subscription_id', subscriptionId)
}

async function markVaBySubscription(subscriptionId: string, values: Record<string, unknown>) {
  await supabaseAdmin
    .from('vas')
    .update(values)
    .eq('stripe_subscription_id', subscriptionId)
}

export async function handlePaddleWebhook(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('paddle-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!verifyPaddleWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: PaddleWebhookEvent
  try {
    event = JSON.parse(rawBody) as PaddleWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const eventType = event.event_type ?? ''
  const data = event.data ?? {}
  const customData = extractCustomData(data)
  const clerkId = asString(customData.clerk_user_id)
  const plan = asString(customData.plan)
  const type = asString(customData.type)

  const customerId = asString(data.customer_id)
  const subscriptionId = asString(data.subscription_id) ?? asString(data.id)
  const subscriptionStatus = asString(data.status)

  switch (eventType) {
    case 'transaction.completed': {
      if (!clerkId) break

      if (type === 'va_badge') {
        await supabaseAdmin
          .from('vas')
          .update({
            is_premium: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq('clerk_user_id', clerkId)
      } else if (plan) {
        await supabaseAdmin
          .from('businesses')
          .update({
            plan,
            subscription_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq('clerk_user_id', clerkId)
      }
      break
    }

    case 'subscription.created':
    case 'subscription.updated': {
      if (!subscriptionId) break
      if (subscriptionStatus === 'past_due') {
        await markBusinessBySubscription(subscriptionId, { subscription_status: 'past_due' })
        break
      }
      if (subscriptionStatus === 'canceled') {
        await markBusinessBySubscription(subscriptionId, { plan: null, subscription_status: 'canceled' })
        await markVaBySubscription(subscriptionId, { is_premium: false })
        break
      }

      await markBusinessBySubscription(subscriptionId, { subscription_status: 'active' })
      await markVaBySubscription(subscriptionId, { is_premium: true })
      break
    }

    case 'subscription.past_due': {
      if (!subscriptionId) break
      await markBusinessBySubscription(subscriptionId, { subscription_status: 'past_due' })
      break
    }

    case 'subscription.canceled': {
      if (!subscriptionId) break
      await markBusinessBySubscription(subscriptionId, { plan: null, subscription_status: 'canceled' })
      await markVaBySubscription(subscriptionId, { is_premium: false })
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
