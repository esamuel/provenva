import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminUserId } from '@/lib/admin'
import { clerkEnabled } from '@/lib/clerk-config'
import type { VAApplication } from '@/types'

type Body = {
  action?: 'approve' | 'reject' | 'mark_test_sent' | 'mark_test_completed'
  test_score?: number | null
  score_accuracy?: number | null
  score_communication?: number | null
  score_tools?: number | null
  reviewer_notes?: string | null
}

const APPROVAL_MIN_SCORE = 75

function boundedScore(n: unknown): number | null {
  if (typeof n !== 'number' || !Number.isFinite(n)) return null
  return Math.max(0, Math.min(100, Math.round(n)))
}

async function updateApplicationSafe(
  id: string,
  payload: Record<string, unknown>
): Promise<{ error: any }> {
  const first = await supabaseAdmin.from('va_applications').update(payload).eq('id', id)
  // Backward compatibility before DB migration is run
  if (first.error?.code === '42703') {
    const fallback = { ...payload }
    delete (fallback as any).score_accuracy
    delete (fallback as any).score_communication
    delete (fallback as any).score_tools
    return await supabaseAdmin.from('va_applications').update(fallback).eq('id', id)
  }
  return first
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!clerkEnabled) return NextResponse.json({ error: 'Auth is not configured' }, { status: 503 })
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminUserId(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let payload: Body
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const action = payload.action
  if (!action) return NextResponse.json({ error: 'action is required' }, { status: 400 })

  const { data: app, error: appErr } = await supabaseAdmin
    .from('va_applications')
    .select('*')
    .eq('id', params.id)
    .maybeSingle() as { data: VAApplication | null; error: any }

  if (appErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const providedScore = boundedScore(payload.test_score)
  const accuracy = boundedScore(payload.score_accuracy)
  const communication = boundedScore(payload.score_communication)
  const tools = boundedScore(payload.score_tools)

  const computedScore =
    accuracy !== null && communication !== null && tools !== null
      ? Math.round(accuracy * 0.4 + communication * 0.3 + tools * 0.3)
      : null

  const testScore = providedScore ?? computedScore ?? app.test_score

  const reviewerNotesParts = [payload.reviewer_notes ?? app.reviewer_notes]
  if (accuracy !== null || communication !== null || tools !== null) {
    reviewerNotesParts.push(
      `[Score breakdown] accuracy=${accuracy ?? '-'} communication=${communication ?? '-'} tools=${tools ?? '-'} computed=${computedScore ?? '-'}`
    )
  }
  const reviewerNotes = reviewerNotesParts.filter(Boolean).join('\n\n')

  if (action === 'mark_test_sent' || action === 'mark_test_completed' || action === 'reject') {
    const status =
      action === 'mark_test_sent'
        ? 'test_sent'
        : action === 'mark_test_completed'
          ? 'test_completed'
          : 'rejected'

    const { error } = await updateApplicationSafe(params.id, {
      status,
      reviewer_notes: reviewerNotes,
      test_score: testScore,
      score_accuracy: accuracy,
      score_communication: communication,
      score_tools: tools,
    })

    if (error) {
      console.error('[admin] update application error:', error)
      return NextResponse.json({ error: 'Could not update application' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  // approve path: publish into vas table
  if (!app.clerk_user_id) {
    return NextResponse.json(
      { error: 'Cannot approve: application has no linked Clerk user.' },
      { status: 400 }
    )
  }

  const publishScore = testScore ?? 80
  if (publishScore < APPROVAL_MIN_SCORE) {
    return NextResponse.json(
      { error: `Cannot approve below minimum score ${APPROVAL_MIN_SCORE}. Current score: ${publishScore}.` },
      { status: 400 }
    )
  }
  const { error: vaErr } = await supabaseAdmin.from('vas').upsert(
    {
      clerk_user_id: app.clerk_user_id,
      full_name: app.full_name,
      headline: app.headline,
      bio: app.bio,
      category: app.category,
      skills: app.skills ?? [],
      hourly_rate_usd: app.hourly_rate_usd,
      availability: app.availability,
      timezone: app.timezone,
      country: app.country,
      status: 'verified',
      test_score: publishScore,
      portfolio_url: app.portfolio_url,
      linkedin_url: app.linkedin_url,
      years_experience: app.years_experience,
    },
    { onConflict: 'clerk_user_id' }
  )

  if (vaErr) {
    console.error('[admin] publish VA error:', vaErr)
    return NextResponse.json({ error: 'Could not publish VA profile' }, { status: 500 })
  }

  const { error: appUpdateErr } = await updateApplicationSafe(params.id, {
    status: 'approved',
    reviewer_notes: reviewerNotes,
    test_score: publishScore,
    score_accuracy: accuracy,
    score_communication: communication,
    score_tools: tools,
  })

  if (appUpdateErr) {
    console.error('[admin] approve application error:', appUpdateErr)
    return NextResponse.json({ error: 'VA published but application update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
