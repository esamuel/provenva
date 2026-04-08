// components/Navbar.tsx
'use client'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function Navbar() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const clerkConfigured =
    typeof publishableKey === 'string' &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('xxxx') &&
    !publishableKey.includes('REPLACE_WITH')

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

          {clerkConfigured ? (
            <AuthedNav />
          ) : (
            <>
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function AuthedNav() {
  // Imported lazily to avoid crashing the app when Clerk keys aren't configured yet.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { SignedIn, SignedOut, UserButton } = require('@clerk/nextjs') as typeof import('@clerk/nextjs')

  return (
    <>
      <SignedOut>
        <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 transition-colors">
          Sign in
        </Link>
        <Link href="/sign-up" className="btn-primary">
          Get started
        </Link>
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard/business" className="btn-outline">
          Dashboard
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  )
}
