import crypto from 'crypto'

const PADDLE_API_BASE = 'https://api.paddle.com'
const WEBHOOK_TOLERANCE_SECONDS = 300

type PaddleApiEnvelope<T> = {
  data: T
  error?: { code?: string; detail?: string }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

async function paddleApiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const apiKey = requireEnv('PADDLE_API_KEY')
  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  const json = (await res.json().catch(() => ({}))) as PaddleApiEnvelope<T>
  if (!res.ok) {
    const detail = json?.error?.detail ?? `HTTP ${res.status}`
    throw new Error(`Paddle API error: ${detail}`)
  }

  if (!json || typeof json !== 'object' || !('data' in json)) {
    throw new Error('Paddle API error: malformed response')
  }

  return json.data
}

type PaddleCheckoutInput = {
  priceId: string
  metadata?: Record<string, string>
  customerId?: string
}

export async function createCheckoutSession({
  priceId,
  metadata,
  customerId,
}: PaddleCheckoutInput): Promise<{ url: string }> {
  const body: Record<string, unknown> = {
    items: [{ price_id: priceId, quantity: 1 }],
    collection_mode: 'automatic',
    custom_data: metadata ?? {},
  }

  if (customerId) body.customer_id = customerId

  const data = await paddleApiRequest<{ checkout?: { url?: string | null } | null }>(
    '/transactions',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )

  const url = data.checkout?.url
  if (!url) {
    throw new Error('Paddle checkout URL was not returned')
  }

  return { url }
}

function findFirstUrl(value: unknown): string | null {
  if (typeof value === 'string' && value.startsWith('http')) return value
  if (!value || typeof value !== 'object') return null

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstUrl(item)
      if (found) return found
    }
    return null
  }

  for (const v of Object.values(value)) {
    const found = findFirstUrl(v)
    if (found) return found
  }
  return null
}

export async function createPortalSession(customerId: string): Promise<{ url: string }> {
  const data = await paddleApiRequest<{ urls?: unknown }>(
    `/customers/${customerId}/portal-sessions`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  )

  const url = findFirstUrl(data.urls)
  if (!url) {
    throw new Error('Paddle customer portal URL was not returned')
  }

  return { url }
}

function parseSignatureHeader(signatureHeader: string): { ts: string; h1: string } | null {
  const parts = signatureHeader.split(';').map((part) => part.trim())
  let ts = ''
  let h1 = ''
  for (const part of parts) {
    if (part.startsWith('ts=')) ts = part.slice(3)
    if (part.startsWith('h1=')) h1 = part.slice(3)
  }
  if (!ts || !h1) return null
  return { ts, h1 }
}

export function verifyPaddleWebhookSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = requireEnv('PADDLE_WEBHOOK_SECRET')
  const parsed = parseSignatureHeader(signatureHeader)
  if (!parsed) return false

  const timestamp = Number(parsed.ts)
  if (!Number.isFinite(timestamp)) return false
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > WEBHOOK_TOLERANCE_SECONDS) return false

  const payload = `${parsed.ts}:${rawBody}`
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  const provided = Buffer.from(parsed.h1, 'hex')
  const expected = Buffer.from(digest, 'hex')
  if (provided.length !== expected.length) return false
  return crypto.timingSafeEqual(provided, expected)
}
