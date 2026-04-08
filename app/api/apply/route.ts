// app/api/apply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    const body = await req.json()

    const {
      full_name, email, category, years_experience,
      headline, bio, hourly_rate_usd, availability,
      timezone, country, portfolio_url, linkedin_url,
    } = body

    // Basic validation
    if (!full_name || !email || !category || !headline || !bio) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for duplicate application by email
    const { data: existing } = await supabaseAdmin
      .from('va_applications')
      .select('id, status')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'An application with this email already exists.' },
        { status: 409 }
      )
    }

    const { error } = await supabaseAdmin.from('va_applications').insert({
      clerk_user_id:   userId ?? null,
      full_name,
      email,
      category,
      years_experience: parseInt(years_experience) || 0,
      headline,
      bio,
      hourly_rate_usd: parseInt(hourly_rate_usd) || 0,
      availability,
      timezone,
      country,
      portfolio_url:   portfolio_url || null,
      linkedin_url:    linkedin_url || null,
      status:          'submitted',
    })

    if (error) {
      console.error('[apply] supabase error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[apply] unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
