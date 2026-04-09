// app/dashboard/business/messages/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import type { VA } from '@/types'
import { MessageSquare } from 'lucide-react'

export default async function BusinessMessagesPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!business) redirect('/onboarding')

  const { data: conversations } = await supabaseAdmin
    .from('conversations')
    .select('id, updated_at, va_id')
    .eq('business_id', business.id)
    .order('updated_at', { ascending: false })

  const list = conversations ?? []
  const vaIds = Array.from(new Set(list.map(c => c.va_id)))
  let vaMap: Record<string, Pick<VA, 'id' | 'full_name' | 'headline'>> = {}
  if (vaIds.length) {
    const { data: vas } = await supabaseAdmin
      .from('vas')
      .select('id, full_name, headline')
      .in('id', vaIds)
    vaMap = Object.fromEntries((vas ?? []).map(v => [v.id, v]))
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inbox</h1>
            <p className="mt-0.5 text-sm text-slate-500">Conversations with VAs</p>
          </div>
          <Link href="/browse" className="btn-outline text-sm">Find VAs</Link>
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 py-16 text-center">
            <MessageSquare className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="mb-4 text-sm text-slate-500">No messages yet</p>
            <p className="mx-auto mb-4 max-w-sm text-xs text-slate-400">
              Open a VA profile and send a message — you need an active plan to start new threads.
            </p>
            <Link href="/browse" className="btn-primary text-sm">Browse VAs</Link>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 divide-y divide-slate-100">
            {list.map(c => {
              const va = vaMap[c.va_id]
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/business/messages/${c.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-slate-50/80"
                  >
                    <p className="font-medium text-slate-900">{va?.full_name ?? 'VA'}</p>
                    <p className="line-clamp-1 text-sm text-slate-500">{va?.headline ?? ''}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(c.updated_at).toLocaleString()}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
