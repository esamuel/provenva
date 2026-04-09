// app/api/conversations/[conversationId]/messages/route.ts — reply in thread
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { canBusinessMessage } from '@/lib/messaging'
import type { Business } from '@/types'

type Ctx = { params: { conversationId: string } }

export async function POST(req: NextRequest, { params }: Ctx) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversationId = params.conversationId
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversation' }, { status: 400 })
  }

  let payload: { body?: string }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const text = typeof payload.body === 'string' ? payload.body.trim() : ''
  if (!text) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }
  if (text.length > 8000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  const { data: conv, error: convErr } = await supabaseAdmin
    .from('conversations')
    .select('id, business_id, va_id')
    .eq('id', conversationId)
    .maybeSingle()

  if (convErr || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('id', conv.business_id)
    .maybeSingle() as { data: Business | null }

  const { data: vaRow } = await supabaseAdmin
    .from('vas')
    .select('clerk_user_id')
    .eq('id', conv.va_id)
    .maybeSingle()

  const isBusiness = business?.clerk_user_id === userId
  const isVa = vaRow?.clerk_user_id === userId

  if (!isBusiness && !isVa) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (isBusiness) {
    if (!business || !canBusinessMessage(business)) {
      return NextResponse.json(
        { error: 'An active subscription is required to send messages' },
        { status: 403 }
      )
    }
  }

  const sender_role = isBusiness ? 'business' : 'va'

  const { error: msgErr } = await supabaseAdmin.from('messages').insert({
    conversation_id: conversationId,
    sender_role,
    body:              text,
  })

  if (msgErr) {
    console.error('[messages] insert error:', msgErr)
    return NextResponse.json({ error: 'Could not send message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
