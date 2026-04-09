'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type ContactVariant =
  | { kind: 'signed_out'; vaId: string }
  | { kind: 'va_account' }
  | { kind: 'needs_onboarding' }
  | { kind: 'no_plan' }
  | { kind: 'open_thread'; conversationId: string }
  | { kind: 'compose'; vaId: string }

export default function ContactVAActions(props: ContactVariant) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (props.kind === 'signed_out') {
    const back = encodeURIComponent(`/va/${props.vaId}`)
    return (
      <Link href={`/sign-in?redirect_url=${back}`} className="btn-primary w-full">
        Sign in to contact
      </Link>
    )
  }

  if (props.kind === 'va_account') {
    return (
      <p className="text-sm text-gray-500 text-center">
        Business accounts can message VAs. Switch to a hiring account or create one to reach out.
      </p>
    )
  }

  if (props.kind === 'needs_onboarding') {
    return (
      <Link href="/onboarding" className="btn-primary w-full">
        Set up hiring profile
      </Link>
    )
  }

  if (props.kind === 'no_plan') {
    return (
      <>
        <Link href="/#pricing" className="btn-primary w-full">
          Subscribe to contact
        </Link>
        <p className="text-xs text-gray-500 text-center mt-2">
          Active plan required to message verified VAs.
        </p>
      </>
    )
  }

  if (props.kind === 'open_thread') {
    return (
      <Link href={`/dashboard/business/messages/${props.conversationId}`} className="btn-primary w-full">
        Open conversation
      </Link>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (props.kind !== 'compose') return
    const t = body.trim()
    if (!t) return
    setLoading(true)
    setErr(null)
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ va_id: props.vaId, body: t }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setErr(typeof data.error === 'string' ? data.error : 'Could not send')
      return
    }
    if (typeof data.redirectUrl === 'string') {
      router.push(data.redirectUrl)
      router.refresh()
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {err && <p className="text-sm text-red-600">{err}</p>}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Introduce your business and what you need help with…"
        rows={4}
        className="input w-full resize-y text-sm"
        maxLength={8000}
      />
      <button type="submit" className="btn-primary w-full" disabled={loading || !body.trim()}>
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
