// lib/messaging.ts — contact limits & eligibility (server-only helpers)
import type { Business } from '@/types'
import { PLANS } from '@/types'

function envFlag(name: string): boolean {
  return (process.env[name] ?? '').trim().toLowerCase() === 'true'
}

export function paymentsPaused(): boolean {
  return envFlag('APP_PAUSE_PAYMENTS')
}

export function getMonthlyContactLimit(plan: Business['plan']): number {
  if (paymentsPaused()) return 999
  if (!plan) return 0
  return PLANS[plan].vas
}

export function canBusinessMessage(b: Business | null): boolean {
  if (paymentsPaused()) return true
  return !!(b?.plan && b.subscription_status === 'active')
}
