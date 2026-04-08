// types/index.ts

export type UserRole = 'business' | 'va'

export type VAStatus = 'pending' | 'in_review' | 'verified' | 'rejected'

export type VACategory =
  | 'admin'
  | 'bookkeeping'
  | 'customer_service'
  | 'social_media'
  | 'ecommerce'
  | 'content'
  | 'technical'

export interface VA {
  id: string
  clerk_user_id: string
  full_name: string
  avatar_url: string | null
  headline: string
  bio: string
  category: VACategory
  skills: string[]
  hourly_rate_usd: number
  availability: 'full_time' | 'part_time' | 'contract'
  timezone: string
  country: string
  status: VAStatus
  test_score: number | null          // 0–100
  portfolio_url: string | null
  linkedin_url: string | null
  years_experience: number
  rehire_rate: number | null         // % of clients who rehired
  avg_response_hours: number | null
  completed_jobs: number
  is_premium: boolean                // paid $29/mo verified badge
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  clerk_user_id: string
  company_name: string
  contact_name: string
  avatar_url: string | null
  industry: string
  company_size: '1-5' | '6-20' | '21-50' | '51-200' | '200+'
  plan: 'starter' | 'pro' | 'scale' | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'active' | 'past_due' | 'canceled' | null
  saved_vas: string[]                // array of VA ids
  created_at: string
}

export interface Hire {
  id: string
  business_id: string
  va_id: string
  status: 'active' | 'completed' | 'cancelled'
  started_at: string
  ended_at: string | null
  placement_fee_paid: boolean
  rehired: boolean
  business_rating: number | null     // 1–5
  va_rating: number | null
  review_text: string | null
  created_at: string
}

export interface VAApplication {
  id: string
  clerk_user_id: string
  full_name: string
  email: string
  category: VACategory
  years_experience: number
  headline: string
  bio: string
  hourly_rate_usd: number
  availability: 'full_time' | 'part_time' | 'contract'
  timezone: string
  country: string
  skills: string[]
  portfolio_url: string | null
  linkedin_url: string | null
  status: 'submitted' | 'test_sent' | 'test_completed' | 'approved' | 'rejected'
  test_score: number | null
  created_at: string
}

// Stripe plan config
export const PLANS = {
  starter: { name: 'Starter', price: 49, vas: 5,  features: ['Browse verified VAs', '5 VA contacts/mo', 'Basic matching'] },
  pro:     { name: 'Pro',     price: 99, vas: 20, features: ['Everything in Starter', '20 VA contacts/mo', 'Priority matching', 'Hire analytics'] },
  scale:   { name: 'Scale',   price: 149, vas: 999, features: ['Everything in Pro', 'Unlimited contacts', 'Dedicated account manager', 'API access'] },
} as const

export const CATEGORIES: Record<VACategory, string> = {
  admin:            'Admin Support',
  bookkeeping:      'Bookkeeping & Finance',
  customer_service: 'Customer Service',
  social_media:     'Social Media',
  ecommerce:        'E-commerce Ops',
  content:          'Content Production',
  technical:        'Technical Support',
}
