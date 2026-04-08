// app/api/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role } = await req.json()
  if (!['business', 'va'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const firstName = user?.firstName ?? ''
  const lastName  = user?.lastName ?? ''
  const fullName  = `${firstName} ${lastName}`.trim() || email

  if (role === 'business') {
    const { error } = await supabaseAdmin
      .from('businesses')
      .upsert({
        clerk_user_id: userId,
        company_name:  fullName,      // user updates this later
        contact_name:  fullName,
        saved_vas:     [],
      }, { onConflict: 'clerk_user_id' })

    if (error) {
      console.error('[onboarding] business upsert error:', error)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }
  }

  if (role === 'va') {
    // VA profile is created later when application is approved.
    // Here we just note the intent in the applications table if they applied,
    // or we redirect them to /apply.
    // Nothing to insert yet — the apply form handles it.
  }

  return NextResponse.json({ success: true, redirect: role === 'business' ? '/dashboard/business' : '/apply' })
}
