// app/apply/page.tsx
'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { CheckCircle } from 'lucide-react'
import { CATEGORIES } from '@/types'
import type { VACategory } from '@/types'

const SKILLS_BY_CATEGORY: Record<VACategory, string[]> = {
  admin:            ['Email management', 'Calendar scheduling', 'Data entry', 'Travel booking', 'Document prep'],
  bookkeeping:      ['QuickBooks', 'Xero', 'Bank reconciliation', 'Invoicing', 'Payroll'],
  customer_service: ['Zendesk', 'Freshdesk', 'Live chat', 'Email support', 'Complaint handling'],
  social_media:     ['Instagram', 'LinkedIn', 'Content scheduling', 'Canva', 'Analytics'],
  ecommerce:        ['Shopify', 'Amazon FBA', 'Order management', 'Returns processing', 'Product listing'],
  content:          ['Blog writing', 'Copywriting', 'Video editing', 'SEO', 'Newsletter'],
  technical:        ['WordPress', 'Webflow', 'Basic coding', 'IT support', 'CRM management'],
}

export default function ApplyPage() {
  const [category, setCategory] = useState<VACategory>('admin')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setLoading(false)
    if (res.ok) setSubmitted(true)
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application submitted!</h1>
          <p className="text-gray-500">We&apos;ll review your profile and send you a skill test within 2 business days.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply to become a verified VA</h1>
          <p className="text-gray-500 text-sm">Applications that pass our review receive a skill test. Verified VAs get a badge and appear in search results.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input name="full_name" required className="input" placeholder="Jane Smith" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required className="input" placeholder="jane@email.com" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">Primary category</label>
            <select name="category" required className="input" value={category} onChange={e => setCategory(e.target.value as VACategory)}>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Headline */}
          <div>
            <label className="label">Professional headline</label>
            <input name="headline" required className="input" placeholder="e.g. QuickBooks expert with 5 years bookkeeping for e-commerce brands" />
          </div>

          {/* Bio */}
          <div>
            <label className="label">Short bio</label>
            <textarea name="bio" required rows={4} className="input resize-none" placeholder="Tell clients what you do, who you help, and what makes you reliable..." />
          </div>

          {/* Rate + availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hourly rate (USD)</label>
              <input name="hourly_rate_usd" type="number" min="5" max="200" required className="input" placeholder="25" />
            </div>
            <div>
              <label className="label">Availability</label>
              <select name="availability" required className="input">
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract / project</option>
              </select>
            </div>
          </div>

          {/* Experience + country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Years of experience</label>
              <input name="years_experience" type="number" min="0" max="40" required className="input" placeholder="3" />
            </div>
            <div>
              <label className="label">Country</label>
              <input name="country" required className="input" placeholder="Philippines" />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="label">Timezone</label>
            <input name="timezone" required className="input" placeholder="GMT+8 (Manila)" />
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Portfolio URL (optional)</label>
              <input name="portfolio_url" type="url" className="input" placeholder="https://yoursite.com" />
            </div>
            <div>
              <label className="label">LinkedIn URL (optional)</label>
              <input name="linkedin_url" type="url" className="input" placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
            {loading ? 'Submitting…' : 'Submit application'}
          </button>
          <p className="text-xs text-gray-400 text-center">You&apos;ll receive a skill test by email within 2 business days.</p>
        </form>
      </div>
    </>
  )
}
