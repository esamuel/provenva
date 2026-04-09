import { NextRequest } from 'next/server'
import { handlePaddleWebhook } from '@/lib/paddle-webhook'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  return handlePaddleWebhook(req)
}
