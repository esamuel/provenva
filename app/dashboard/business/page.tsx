// app/dashboard/business/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import VACard from '@/components/VACard'
import Link from 'next/link'
import { MessageSquare, Search, CreditCard, Users } from 'lucide-react'
import type { VA, Business } from '@/types'
import { isAdminUserId } from '@/lib/admin'
import { paymentsPaused } from '@/lib/messaging'

export default async function BusinessDashboard() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')
  const isAdmin = isAdminUserId(userId)
  const paused = paymentsPaused()

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('clerk_user_id', userId)
    .single() as { data: Business | null }

  // Fetch saved VAs if any
  let savedVAs: VA[] = []
  if (business?.saved_vas?.length) {
    const { data } = await supabaseAdmin
      .from('vas')
      .select('*')
      .in('id', business.saved_vas) as { data: VA[] | null }
    savedVAs = data ?? []
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back{business?.contact_name ? `, ${business.contact_name.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Plan: <span className="capitalize font-medium text-slate-700">{business?.plan ?? 'None'}</span>
              {isAdmin && <span className="ml-2 badge">Admin override active</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/business/messages" className="btn-outline">
              <MessageSquare size={16} /> Inbox
            </Link>
            <Link href="/browse" className="btn-primary">
              <Search size={16} /> Find VAs
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Saved VAs', value: savedVAs.length, icon: Users },
            { label: 'Active hires', value: 0, icon: Users },
            { label: 'Plan', value: business?.plan ? business.plan.charAt(0).toUpperCase() + business.plan.slice(1) : 'None', icon: CreditCard },
          ].map(s => (
            <div key={s.label} className="surface bg-white/95 p-4">
              <p className="mb-1 text-xs text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Upgrade banner if no plan */}
        {!business?.plan && !isAdmin && !paused && (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50 p-5">
            <div>
              <p className="font-semibold text-brand-900">Subscribe to contact VAs</p>
              <p className="text-sm text-brand-700 mt-0.5">Plans start at $49/month. Browse is always free.</p>
            </div>
            <Link href="/#pricing" className="btn-primary">View plans</Link>
          </div>
        )}

        {/* Saved VAs */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Saved VAs</h2>
          {savedVAs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedVAs.map(va => <VACard key={va.id} va={va} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 py-12 text-center">
              <p className="mb-3 text-sm text-slate-500">No saved VAs yet</p>
              <Link href="/browse" className="btn-outline text-sm">Browse verified VAs</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
