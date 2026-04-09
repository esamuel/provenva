// components/Navbar.tsx
'use client'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { CheckCircle, Menu, MessageSquare, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clerkEnabled } from '@/lib/clerk-config'

function SignedInNavExtras() {
  const [dashboardHref, setDashboardHref] = useState('/dashboard/business')
  const [showInbox, setShowInbox] = useState(false)
  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then((d: { business?: boolean; va?: boolean }) => {
        const b = !!d.business
        const v = !!d.va
        setShowInbox(b || v)
        if (v && !b) setDashboardHref('/dashboard/va')
        else setDashboardHref('/dashboard/business')
      })
      .catch(() => {
        setShowInbox(false)
        setDashboardHref('/dashboard/business')
      })
  }, [])
  return (
    <>
      {showInbox && (
        <Link href="/dashboard/messages" className="btn-ghost inline-flex items-center gap-1.5">
          <MessageSquare size={16} /> Inbox
        </Link>
      )}
      <Link href={dashboardHref} className="btn-outline">Dashboard</Link>
    </>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="container flex h-[72px] items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
          <CheckCircle size={20} className="text-brand-600" />
          ProvenVA
        </Link>

        {/* Marketplace search (simple; filters live on /browse) */}
        <form action="/browse" className="hidden lg:flex flex-1 items-center">
          <div className="relative w-full max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              placeholder="Search skills, tools, or roles (e.g. “Shopify”, “Executive assistant”)"
              className="input pl-9 pr-3 py-2.5 border-slate-200/80 bg-white/90"
            />
          </div>
        </form>

        <div className="ml-auto hidden items-center gap-1.5 text-sm md:flex">
          <Link href="/browse" className="btn-ghost">Browse</Link>
          <Link href="/#pricing" className="btn-ghost hidden sm:inline-flex">Pricing</Link>
          <Link href="/apply" className="btn-outline hidden md:inline-flex">Apply as VA</Link>

          {clerkEnabled ? (
            <>
              <SignedOut>
                <Link href="/sign-in" className="btn-ghost">Sign in</Link>
                <Link href="/sign-up" className="btn-primary">Get started</Link>
              </SignedOut>

              <SignedIn>
                <SignedInNavExtras />
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          ) : (
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 sm:inline-flex">
              Configure Clerk keys to enable auth
            </span>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 md:hidden"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200/70 bg-white px-4 py-3 md:hidden">
          <form action="/browse" className="mb-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                placeholder="Search VAs, skills, tools..."
                className="input bg-white pl-9"
              />
            </div>
          </form>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/browse" className="btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Browse</Link>
            <Link href="/#pricing" className="btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/apply" className="btn-outline justify-start" onClick={() => setMobileOpen(false)}>Apply as VA</Link>
            {clerkEnabled ? (
              <>
                <SignedOut>
                  <Link href="/sign-in" className="btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Sign in</Link>
                  <Link href="/sign-up" className="btn-primary justify-start" onClick={() => setMobileOpen(false)}>Get started</Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard/messages" className="btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Inbox</Link>
                  <Link href="/dashboard/messages" className="btn-outline justify-start" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                </SignedIn>
              </>
            ) : (
              <span className="col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                Configure Clerk keys to enable auth
              </span>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
