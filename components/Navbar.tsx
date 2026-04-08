// components/Navbar.tsx
'use client'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { CheckCircle } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <CheckCircle size={20} className="text-brand-500" />
          ProvenVA
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/browse" className="text-gray-600 hover:text-gray-900 transition-colors">Browse VAs</Link>
          <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/apply" className="text-gray-600 hover:text-gray-900 transition-colors">Apply as VA</Link>

          <SignedOut>
            <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="btn-primary">Get started</Link>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard/business" className="btn-outline">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}
