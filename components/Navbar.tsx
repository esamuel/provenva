// components/Navbar.tsx
'use client'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { CheckCircle, Search } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200/70 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="container h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <CheckCircle size={20} className="text-brand-500" />
          ProvenVA
        </Link>

        {/* Marketplace search (simple; filters live on /browse) */}
        <form action="/browse" className="hidden md:flex flex-1 items-center">
          <div className="relative w-full max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="q"
              placeholder="Search skills, tools, or roles (e.g. “Shopify”, “Executive assistant”)"
              className="input pl-9 pr-3 py-2.5"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <Link href="/browse" className="btn-ghost">Browse</Link>
          <Link href="/#pricing" className="btn-ghost">Pricing</Link>
          <Link href="/apply" className="btn-outline hidden sm:inline-flex">Apply as VA</Link>

          <SignedOut>
            <Link href="/sign-in" className="btn-ghost">Sign in</Link>
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
