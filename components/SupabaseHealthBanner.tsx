'use client'

import { useEffect, useState } from 'react'

type HealthResponse = {
  ok: boolean
  reason?: string
}

export default function SupabaseHealthBanner() {
  const [message, setMessage] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/health/supabase', { cache: 'no-store' })
      .then(async (r) => {
        const data = (await r.json().catch(() => ({}))) as HealthResponse
        if (!r.ok || !data.ok) {
          setMessage(data.reason ?? 'Supabase connection check failed.')
        }
      })
      .catch((err: unknown) => {
        const reason = err instanceof Error ? err.message : 'Unknown error'
        setMessage(`Supabase health check failed: ${reason}`)
      })
  }, [])

  if (!message || dismissed) return null

  return (
    <div className="border-b border-amber-200 bg-amber-50/95">
      <div className="container flex items-start gap-3 py-2.5 text-amber-900">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide">Configuration warning</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-md border border-amber-300 px-2 py-1 text-xs font-medium hover:bg-amber-100"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
