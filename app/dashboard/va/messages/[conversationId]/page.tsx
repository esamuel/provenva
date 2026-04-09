// app/dashboard/va/messages/[conversationId]/page.tsx
import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import MessageComposer from '@/components/MessageComposer'
import type { Message } from '@/types'
import { ArrowLeft } from 'lucide-react'
import clsx from 'clsx'

export default async function VAThreadPage({
  params,
}: {
  params: { conversationId: string }
}) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const { data: va } = await supabaseAdmin
    .from('vas')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!va) redirect('/dashboard/va')

  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id, business_id')
    .eq('id', params.conversationId)
    .eq('va_id', va.id)
    .maybeSingle()

  if (!conv) notFound()

  const { data: biz } = await supabaseAdmin
    .from('businesses')
    .select('company_name, contact_name')
    .eq('id', conv.business_id)
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
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/dashboard/va/messages"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} /> All conversations
        </Link>

        <div className="mb-4 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-200/50">
          <h1 className="text-xl font-bold text-slate-900">{biz?.company_name}</h1>
          <p className="text-sm text-slate-500">{biz?.contact_name}</p>
        </div>

        <div className="mb-6 min-h-[200px] space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm shadow-slate-200/40">
          {rows.map(m => (
            <div
              key={m.id}
              className={clsx(
                'max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm',
                m.sender_role === 'va'
                  ? 'ml-auto bg-brand-600 text-white'
                  : 'mr-auto border border-slate-200 bg-slate-100 text-slate-900'
              )}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p
                className={clsx(
                  'mt-2 text-[10px] opacity-70',
                  m.sender_role === 'va' ? 'text-brand-100' : 'text-gray-400'
                )}
              >
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="surface bg-white/95 p-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Reply</p>
          <MessageComposer conversationId={conv.id} />
        </div>
      </div>
    </>
  )
}
