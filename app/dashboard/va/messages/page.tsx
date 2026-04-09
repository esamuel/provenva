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
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500 mt-0.5">Messages from businesses</p>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto">
              When a subscribed business contacts you, the thread appears here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
            {list.map(c => {
              const biz = bizMap[c.business_id]
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/va/messages/${c.id}`}
                    className="block px-4 py-4 hover:bg-gray-50/80 transition-colors"
                  >
                    <p className="font-medium text-gray-900">{biz?.company_name ?? 'Business'}</p>
                    <p className="text-sm text-gray-500">{biz?.contact_name}</p>
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
