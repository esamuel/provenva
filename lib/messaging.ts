// lib/messaging.ts — contact limits & eligibility (server-only helpers)
import type { Business } from '@/types'
import { PLANS } from '@/types'

export function getMonthlyContactLimit(plan: Business['plan']): number {
  if (!plan) return 0
  return PLANS[plan].vas
}

export function canBusinessMessage(b: Business | null): boolean {
  return !!(b?.plan && b.subscription_status === 'active')
}
