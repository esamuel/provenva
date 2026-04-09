'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const t = body.trim()
    if (!t) return
    setLoading(true)
    setErr(null)
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: t }),
    })
    setLoading(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(typeof j.error === 'string' ? j.error : 'Failed to send')
      return
    }
    setBody('')
    router.refresh()
  }

  return (
    <form onSubmit={send} className="space-y-2">
      {err && <p className="text-sm text-red-600">{err}</p>}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write a message…"
        rows={4}
        className="input w-full resize-y min-h-[100px]"
        maxLength={8000}
      />
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading || !body.trim()}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}
