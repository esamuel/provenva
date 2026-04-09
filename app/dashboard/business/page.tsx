// app/dashboard/business/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import VACard from '@/components/VACard'
import Link from 'next/link'
import { MessageSquare, Search, CreditCard, Users } from 'lucide-react'
import type { VA, Business } from '@/types'

export default async function BusinessDashboard() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{business?.contact_name ? `, ${business.contact_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Plan: <span className="capitalize font-medium text-gray-700">{business?.plan ?? 'None'}</span>
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
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Saved VAs', value: savedVAs.length, icon: Users },
            { label: 'Active hires', value: 0, icon: Users },
            { label: 'Plan', value: business?.plan ? business.plan.charAt(0).toUpperCase() + business.plan.slice(1) : 'None', icon: CreditCard },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Upgrade banner if no plan */}
        {!business?.plan && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 flex items-center justify-between mb-8">
            <div>
              <p className="font-semibold text-brand-900">Subscribe to contact VAs</p>
              <p className="text-sm text-brand-700 mt-0.5">Plans start at $49/month. Browse is always free.</p>
            </div>
            <Link href="/#pricing" className="btn-primary">View plans</Link>
          </div>
        )}

        {/* Saved VAs */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Saved VAs</h2>
          {savedVAs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedVAs.map(va => <VACard key={va.id} va={va} />)}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-400 text-sm mb-3">No saved VAs yet</p>
              <Link href="/browse" className="btn-outline text-sm">Browse verified VAs</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
