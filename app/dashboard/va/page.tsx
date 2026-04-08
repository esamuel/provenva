// app/dashboard/va/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { VA } from '@/types'
import { CATEGORIES } from '@/types'

export default async function VADashboard() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const { data: va } = await supabaseAdmin
    .from('vas')
    .select('*')
    .eq('clerk_user_id', userId)
    .single() as { data: VA | null }

  const statusConfig = {
    pending:   { label: 'Application received', icon: Clock,       color: 'text-amber-500',  bg: 'bg-amber-50'  },
    in_review: { label: 'Under review',          icon: Clock,       color: 'text-blue-500',   bg: 'bg-blue-50'   },
    verified:  { label: 'Verified',               icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    rejected:  { label: 'Not approved',           icon: AlertCircle, color: 'text-red-500',    bg: 'bg-red-50'    },
  }

  const status = va ? statusConfig[va.status] : null

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">VA Dashboard</h1>

        {!va ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 mb-4">You haven&apos;t applied yet.</p>
            <Link href="/apply" className="btn-primary">Apply now</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status card */}
            <div className={`${status?.bg} rounded-xl p-5 flex items-center gap-3`}>
              {status && <status.icon size={22} className={status.color} />}
              <div>
                <p className="font-semibold text-gray-900">Status: {status?.label}</p>
                {va.status === 'pending' && <p className="text-sm text-gray-500 mt-0.5">We&apos;ll send your skill test within 2 business days.</p>}
                {va.status === 'in_review' && <p className="text-sm text-gray-500 mt-0.5">Our team is reviewing your test results.</p>}
                {va.status === 'verified' && <p className="text-sm text-gray-500 mt-0.5">Your profile is live. Businesses can find you now.</p>}
                {va.status === 'rejected' && <p className="text-sm text-gray-500 mt-0.5">Sorry, your application didn&apos;t pass this round. You may reapply in 90 days.</p>}
              </div>
            </div>

            {/* Profile summary */}
            <div className="card space-y-3">
              <h2 className="font-semibold text-gray-900">Your profile</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Name</span><p className="font-medium">{va.full_name}</p></div>
                <div><span className="text-gray-400">Category</span><p className="font-medium">{CATEGORIES[va.category]}</p></div>
                <div><span className="text-gray-400">Rate</span><p className="font-medium">${va.hourly_rate_usd}/hr</p></div>
                <div><span className="text-gray-400">Availability</span><p className="font-medium capitalize">{va.availability.replace('_', ' ')}</p></div>
                <div><span className="text-gray-400">Test score</span><p className="font-medium">{va.test_score !== null ? `${va.test_score}%` : 'Pending'}</p></div>
                <div><span className="text-gray-400">Premium badge</span><p className="font-medium">{va.is_premium ? 'Active ($29/mo)' : 'Not subscribed'}</p></div>
              </div>
            </div>

            {/* Get premium badge */}
            {va.status === 'verified' && !va.is_premium && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-900">Get your verified badge</p>
                  <p className="text-sm text-brand-700 mt-0.5">Appear higher in search results for $29/month.</p>
                </div>
                <Link href="/api/checkout/va" className="btn-primary text-sm">Get badge</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
