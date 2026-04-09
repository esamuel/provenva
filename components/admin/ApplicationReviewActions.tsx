'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  applicationId: string
  defaultScore: number | null
  defaultNotes: string | null
  hasClerkUserId: boolean
  defaultAccuracy?: number | null
  defaultCommunication?: number | null
  defaultTools?: number | null
}

export default function ApplicationReviewActions({
  applicationId,
  defaultScore,
  defaultNotes,
  hasClerkUserId,
  defaultAccuracy,
  defaultCommunication,
  defaultTools,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState<string>(defaultScore?.toString() ?? '')
  const [accuracy, setAccuracy] = useState<string>(defaultAccuracy?.toString() ?? '')
  const [communication, setCommunication] = useState<string>(defaultCommunication?.toString() ?? '')
  const [tools, setTools] = useState<string>(defaultTools?.toString() ?? '')
  const [notes, setNotes] = useState<string>(defaultNotes ?? '')

  const computedScore = (() => {
    const a = Number(accuracy)
    const c = Number(communication)
    const t = Number(tools)
    if (!Number.isFinite(a) || !Number.isFinite(c) || !Number.isFinite(t)) return null
    if (a < 0 || a > 100 || c < 0 || c > 100 || t < 0 || t > 100) return null
    return Math.round(a * 0.4 + c * 0.3 + t * 0.3)
  })()

  async function call(action: 'approve' | 'reject' | 'mark_test_sent' | 'mark_test_completed') {
    setLoading(action)
    setError(null)
    const res = await fetch(`/api/admin/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        test_score: score ? Number(score) : null,
        score_accuracy: accuracy ? Number(accuracy) : null,
        score_communication: communication ? Number(communication) : null,
        score_tools: tools ? Number(tools) : null,
        reviewer_notes: notes || null,
      }),
    })
    setLoading(null)

    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(typeof j.error === 'string' ? j.error : 'Action failed')
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Test score (0-100)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <button
            type="button"
            className="mt-2 btn-outline text-xs"
            onClick={() => computedScore !== null && setScore(String(computedScore))}
            disabled={computedScore === null}
          >
            Use computed score {computedScore !== null ? `(${computedScore})` : ''}
          </button>
        </div>
        <div>
          <label className="label">Actions</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-outline text-xs"
              onClick={() => call('mark_test_sent')}
              disabled={!!loading}
            >
              {loading === 'mark_test_sent' ? 'Saving…' : 'Mark test sent'}
            </button>
            <button
              type="button"
              className="btn-outline text-xs"
              onClick={() => call('mark_test_completed')}
              disabled={!!loading}
            >
              {loading === 'mark_test_completed' ? 'Saving…' : 'Mark test done'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Accuracy (40%)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={accuracy}
            onChange={(e) => setAccuracy(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Communication (30%)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={communication}
            onChange={(e) => setCommunication(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Tools fluency (30%)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={tools}
            onChange={(e) => setTools(e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Computed score = 40% accuracy + 30% communication + 30% tools.
      </p>

      <div>
        <label className="label">Reviewer notes</label>
        <textarea
          className="input min-h-[120px] resize-y"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Strengths, concerns, reasons for decision..."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => call('approve')}
          disabled={!!loading || !hasClerkUserId}
          title={!hasClerkUserId ? 'Cannot approve: application has no linked Clerk user' : undefined}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve + publish VA'}
        </button>
        <button
          type="button"
          className="btn-outline border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => call('reject')}
          disabled={!!loading}
        >
          {loading === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
      </div>
      {!hasClerkUserId && (
        <p className="text-xs text-amber-700">
          This application has no linked Clerk account, so auto-publish is blocked. Ask the VA to sign up and reapply.
        </p>
      )}
    </div>
  )
}
