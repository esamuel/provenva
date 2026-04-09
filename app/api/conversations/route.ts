// app/api/conversations/route.ts — start or continue a thread (business only)
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { canBusinessMessage, getMonthlyContactLimit } from '@/lib/messaging'
import type { Business } from '@/types'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { va_id?: string; body?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const vaId = body.va_id?.trim()
  const text = typeof body.body === 'string' ? body.body.trim() : ''
  if (!vaId || !text) {
    return NextResponse.json({ error: 'va_id and body are required' }, { status: 400 })
  }
  if (text.length > 8000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle() as { data: Business | null }

  if (!business) {
    return NextResponse.json({ error: 'Complete business onboarding first' }, { status: 403 })
  }

  if (!canBusinessMessage(business)) {
    return NextResponse.json(
      { error: 'An active subscription is required to contact VAs' },
      { status: 403 }
    )
  }

  const { data: va } = await supabaseAdmin
    .from('vas')
    .select('id')
    .eq('id', vaId)
    .eq('status', 'verified')
    .maybeSingle()

  if (!va) {
    return NextResponse.json({ error: 'VA not found' }, { status: 404 })
  }

  const { data: existing } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('business_id', business.id)
    .eq('va_id', vaId)
    .maybeSingle()

  let conversationId = existing?.id as string | undefined

  if (!conversationId) {
    const limit = getMonthlyContactLimit(business.plan)
    const startOfMonth = new Date()
    startOfMonth.setUTCDate(1)
    startOfMonth.setUTCHours(0, 0, 0, 0)

    const { count, error: countErr } = await supabaseAdmin
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .gte('created_at', startOfMonth.toISOString())

    if (countErr) {
      console.error('[conversations] count error:', countErr)
      return NextResponse.json({ error: 'Could not verify contact limit' }, { status: 500 })
    }

    if (limit < 999 && (count ?? 0) >= limit) {
      return NextResponse.json(
        { error: `Monthly contact limit reached (${limit} new conversations). Upgrade your plan or wait until next month.` },
        { status: 403 }
      )
    }

    const { data: created, error: insErr } = await supabaseAdmin
      .from('conversations')
      .insert({ business_id: business.id, va_id: vaId })
      .select('id')
      .single()

    if (insErr || !created) {
      console.error('[conversations] insert error:', insErr)
      return NextResponse.json({ error: 'Could not open conversation' }, { status: 500 })
    }

    conversationId = created.id as string
  }

  const { error: msgErr } = await supabaseAdmin.from('messages').insert({
    conversation_id: conversationId,
    sender_role:     'business',
    body:            text,
  })

  if (msgErr) {
    console.error('[conversations] message error:', msgErr)
    return NextResponse.json({ error: 'Could not send message' }, { status: 500 })
  }

  return NextResponse.json({
    conversationId,
    redirectUrl: `/dashboard/business/messages/${conversationId}`,
  })
}
