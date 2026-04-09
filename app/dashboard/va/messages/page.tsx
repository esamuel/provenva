// app/dashboard/va/messages/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import type { Business } from '@/types'
import { MessageSquare } from 'lucide-react'

export default async function VAMessagesPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const { data: va } = await supabaseAdmin
    .from('vas')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!va) redirect('/dashboard/va')

  const { data: conversations } = await supabaseAdmin
    .from('conversations')
    .select('id, updated_at, business_id')
    .eq('va_id', va.id)
    .order('updated_at', { ascending: false })

  const list = conversations ?? []
  const bizIds = Array.from(new Set(list.map(c => c.business_id)))
  let bizMap: Record<string, Pick<Business, 'id' | 'company_name' | 'contact_name'>> = {}
  if (bizIds.length) {
    const { data: businesses } = await supabaseAdmin
      .from('businesses')
      .select('id, company_name, contact_name')
      .in('id', bizIds)
    bizMap = Object.fromEntries((businesses ?? []).map(b => [b.id, b]))
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inbox</h1>
          <p className="mt-0.5 text-sm text-slate-500">Messages from businesses</p>
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 py-16 text-center">
            <MessageSquare className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="text-sm text-slate-500">No messages yet</p>
            <p className="mx-auto mt-2 max-w-sm text-xs text-slate-400">
              When a subscribed business contacts you, the thread appears here.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 divide-y divide-slate-100">
            {list.map(c => {
              const biz = bizMap[c.business_id]
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/va/messages/${c.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-slate-50/80"
                  >
                    <p className="font-medium text-slate-900">{biz?.company_name ?? 'Business'}</p>
                    <p className="text-sm text-slate-500">{biz?.contact_name}</p>
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
