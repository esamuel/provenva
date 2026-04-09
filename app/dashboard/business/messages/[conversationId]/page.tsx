// app/dashboard/business/messages/[conversationId]/page.tsx
import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import MessageComposer from '@/components/MessageComposer'
import type { Message } from '@/types'
import { ArrowLeft } from 'lucide-react'
import clsx from 'clsx'

export default async function BusinessThreadPage({
  params,
}: {
  params: { conversationId: string }
}) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!business) redirect('/onboarding')

  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id, va_id')
    .eq('id', params.conversationId)
    .eq('business_id', business.id)
    .maybeSingle()

  if (!conv) notFound()

  const { data: va } = await supabaseAdmin
    .from('vas')
    .select('full_name, headline')
    .eq('id', conv.va_id)
    .single()

  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true }) as { data: Message[] | null }

  const rows = messages ?? []

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/dashboard/business/messages"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={16} /> All conversations
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{va?.full_name}</h1>
          <p className="text-sm text-gray-500">{va?.headline}</p>
        </div>

        <div className="space-y-3 mb-6 min-h-[200px]">
          {rows.map(m => (
            <div
              key={m.id}
              className={clsx(
                'rounded-xl px-4 py-3 max-w-[85%] text-sm',
                m.sender_role === 'business'
                  ? 'ml-auto bg-brand-600 text-white'
                  : 'mr-auto bg-gray-100 text-gray-900'
              )}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p
                className={clsx(
                  'text-[10px] mt-2 opacity-70',
                  m.sender_role === 'business' ? 'text-brand-100' : 'text-gray-400'
                )}
              >
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="surface p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Reply</p>
          <MessageComposer conversationId={conv.id} />
        </div>
      </div>
    </>
  )
}
