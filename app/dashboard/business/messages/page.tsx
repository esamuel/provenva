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
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
            <p className="text-sm text-gray-500 mt-0.5">Conversations with VAs</p>
          </div>
          <Link href="/browse" className="btn-outline text-sm">Find VAs</Link>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 text-sm mb-4">No messages yet</p>
            <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
              Open a VA profile and send a message — you need an active plan to start new threads.
            </p>
            <Link href="/browse" className="btn-primary text-sm">Browse VAs</Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
            {list.map(c => {
              const va = vaMap[c.va_id]
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/business/messages/${c.id}`}
                    className="block px-4 py-4 hover:bg-gray-50/80 transition-colors"
                  >
                    <p className="font-medium text-gray-900">{va?.full_name ?? 'VA'}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{va?.headline ?? ''}</p>
                    <p className="text-xs text-gray-400 mt-1">
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
