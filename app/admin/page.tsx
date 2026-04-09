import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminUserId } from '@/lib/admin'
import { clerkEnabled } from '@/lib/clerk-config'
import { CATEGORIES } from '@/types'
import type { VAApplication } from '@/types'

export default async function AdminPage() {
  if (!clerkEnabled) redirect('/')
  const { userId } = auth()
  if (!userId) redirect('/sign-in')
  if (!isAdminUserId(userId)) redirect('/dashboard/messages')

  const { data: apps } = await supabaseAdmin
    .from('va_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200) as { data: VAApplication[] | null }

  const rows = apps ?? []
  const counts = {
    submitted: rows.filter(a => a.status === 'submitted').length,
    test_sent: rows.filter(a => a.status === 'test_sent').length,
    test_completed: rows.filter(a => a.status === 'test_completed').length,
    approved: rows.filter(a => a.status === 'approved').length,
    rejected: rows.filter(a => a.status === 'rejected').length,
  }
  const reviewed = rows.filter(a => a.test_score !== null)
  const avg = (vals: number[]) => (vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null)
  const avgScore = avg(reviewed.map(a => a.test_score as number))
  const avgAccuracy = avg(rows.map(a => a.score_accuracy).filter((x): x is number => typeof x === 'number'))
  const avgCommunication = avg(rows.map(a => a.score_communication).filter((x): x is number => typeof x === 'number'))
  const avgTools = avg(rows.map(a => a.score_tools).filter((x): x is number => typeof x === 'number'))
  const passRate = reviewed.length ? Math.round((counts.approved / reviewed.length) * 100) : 0

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Console</h1>
            <p className="mt-1 text-sm text-slate-500">Review VA applications and publish verified profiles.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/browse" className="btn-outline text-sm">Open marketplace</Link>
            <Link href="/dashboard/business/messages" className="btn-outline text-sm">Open inbox</Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ['Submitted', counts.submitted],
            ['Test sent', counts.test_sent],
            ['Test done', counts.test_completed],
            ['Approved', counts.approved],
            ['Rejected', counts.rejected],
          ].map(([label, val]) => (
            <div key={label} className="surface bg-white/95 p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{val}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className="surface bg-white/95 p-5">
            <h2 className="text-sm font-semibold text-slate-900">Qualification analytics</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Avg final score</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{avgScore ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Approval rate (reviewed)</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{passRate}%</p>
              </div>
            </div>
          </div>

          <div className="surface bg-white/95 p-5">
            <h2 className="text-sm font-semibold text-slate-900">Sub-score averages</h2>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { label: 'Accuracy', value: avgAccuracy },
                { label: 'Communication', value: avgCommunication },
                { label: 'Tools fluency', value: avgTools },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-slate-600">{label}</p>
                    <p className="font-semibold text-slate-900">{value ?? '—'}</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 py-16 text-center">
            <p className="text-slate-500">No applications yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Experience</th>
                  <th className="px-4 py-3 font-semibold">Rate</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{app.full_name}</p>
                      <p className="text-xs text-slate-500">{app.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{CATEGORIES[app.category]}</td>
                    <td className="px-4 py-3 text-slate-700">{app.years_experience}y</td>
                    <td className="px-4 py-3 text-slate-700">${app.hourly_rate_usd}/hr</td>
                    <td className="px-4 py-3 text-slate-700">{app.test_score ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="badge capitalize">{app.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(app.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/applications/${app.id}`} className="btn-outline text-xs">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
