// app/onboarding/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, UserCheck } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function pickRole(role: 'business' | 'va') {
    setLoading(true)
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    router.push(role === 'business' ? '/dashboard/business' : '/dashboard/va')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ProvenVA</h1>
        <p className="text-gray-500 mb-10">How will you use ProvenVA?</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => pickRole('business')}
            disabled={loading}
            className="card text-center hover:border-brand-500 transition-all cursor-pointer group py-8"
          >
            <Briefcase size={32} className="mx-auto mb-3 text-gray-400 group-hover:text-brand-500 transition-colors" />
            <p className="font-semibold text-gray-900">I&apos;m hiring</p>
            <p className="text-xs text-gray-400 mt-1">Find & hire verified VAs</p>
          </button>

          <button
            onClick={() => pickRole('va')}
            disabled={loading}
            className="card text-center hover:border-brand-500 transition-all cursor-pointer group py-8"
          >
            <UserCheck size={32} className="mx-auto mb-3 text-gray-400 group-hover:text-brand-500 transition-colors" />
            <p className="font-semibold text-gray-900">I&apos;m a VA</p>
            <p className="text-xs text-gray-400 mt-1">Apply to get verified</p>
          </button>
        </div>
      </div>
    </div>
  )
}
