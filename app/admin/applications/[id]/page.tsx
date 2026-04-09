import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminUserId } from '@/lib/admin'
import { clerkEnabled } from '@/lib/clerk-config'
import { CATEGORIES } from '@/types'
import type { VA, VAApplication } from '@/types'
import ApplicationReviewActions from '@/components/admin/ApplicationReviewActions'

export default async function AdminApplicationPage({
  params,
}: {
  params: { id: string }
}) {
  if (!clerkEnabled) redirect('/')
  const { userId } = auth()
  if (!userId) redirect('/sign-in')
  if (!isAdminUserId(userId)) redirect('/dashboard/messages')

  const { data: app } = await supabaseAdmin
    .from('va_applications')
    .select('*')
    .eq('id', params.id)
    .maybeSingle() as { data: VAApplication | null }

  if (!app) notFound()

  let existingVA: Pick<VA, 'id' | 'status' | 'test_score'> | null = null
  if (app.clerk_user_id) {
    const { data } = await supabaseAdmin
      .from('vas')
      .select('id, status, test_score')
      .eq('clerk_user_id', app.clerk_user_id)
      .maybeSingle()
    existingVA = (data as Pick<VA, 'id' | 'status' | 'test_score'> | null) ?? null
  }

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <Link href="/admin" className="btn-ghost mb-5">← Back to admin queue</Link>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="surface bg-white/95 p-6">
            <h1 className="text-2xl font-bold text-slate-900">{app.full_name}</h1>
            <p className="text-sm text-slate-500 mt-1">{app.email}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-slate-500">Category</span><p className="font-medium">{CATEGORIES[app.category]}</p></div>
              <div><span className="text-slate-500">Availability</span><p className="font-medium capitalize">{app.availability.replace('_', ' ')}</p></div>
              <div><span className="text-slate-500">Experience</span><p className="font-medium">{app.years_experience} years</p></div>
              <div><span className="text-slate-500">Rate</span><p className="font-medium">${app.hourly_rate_usd}/hr</p></div>
              <div><span className="text-slate-500">Country</span><p className="font-medium">{app.country}</p></div>
              <div><span className="text-slate-500">Timezone</span><p className="font-medium">{app.timezone}</p></div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Headline</p>
              <p className="mt-1 text-sm text-slate-800">{app.headline}</p>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bio</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{app.bio}</p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="surface bg-white/95 p-5">
              <p className="text-xs text-slate-500">Application status</p>
              <p className="mt-1 font-semibold capitalize text-slate-900">{app.status.replace('_', ' ')}</p>
              <p className="mt-3 text-xs text-slate-500">Created</p>
              <p className="text-sm text-slate-800">{new Date(app.created_at).toLocaleString()}</p>
              <p className="mt-3 text-xs text-slate-500">Clerk user</p>
              <p className="text-sm font-mono text-slate-700 break-all">{app.clerk_user_id || 'None'}</p>
            </div>

            {existingVA && (
              <div className="surface bg-emerald-50 border-emerald-100 p-5">
                <p className="text-sm font-semibold text-emerald-900">VA profile already exists</p>
                <p className="text-xs text-emerald-700 mt-1">ID: {existingVA.id}</p>
                <p className="text-xs text-emerald-700">Status: {existingVA.status}</p>
                <Link className="btn-outline text-xs mt-3" href={`/va/${existingVA.id}`}>Open profile</Link>
              </div>
            )}

            <div className="surface bg-white/95 p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Review actions</h2>
              <ApplicationReviewActions
                applicationId={app.id}
                defaultScore={app.test_score}
                defaultNotes={app.reviewer_notes}
                hasClerkUserId={!!app.clerk_user_id}
                defaultAccuracy={app.score_accuracy}
                defaultCommunication={app.score_communication}
                defaultTools={app.score_tools}
              />
              <p className="mt-3 text-xs text-slate-500">
                Approval rule: final score must be at least 75.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
