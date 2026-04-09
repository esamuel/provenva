// app/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CheckCircle, Search, ShieldCheck, TrendingUp, Star, ArrowRight, Sparkles } from 'lucide-react'
import { PLANS } from '@/types'

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,85,230,0.10),transparent_55%)]" />
        <div className="container pt-14 pb-10 relative">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-brand-100">
                <Sparkles size={13} />
                VAs are skill-tested before they appear in search
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                Hire a <span className="text-brand-600">verified</span> virtual assistant — fast.
              </h1>
              <p className="text-lg text-gray-600 mt-4 max-w-xl">
                Browse a marketplace of proven talent. Compare skill scores, response times, and rehire rates — then contact with confidence.
              </p>

              <form action="/browse" className="mt-7">
                <div className="surface p-2 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="q"
                      placeholder="Search: Executive Assistant, Shopify, Notion, Email..."
                      className="input pl-9 py-2.5 border-0 focus:ring-0 focus:border-transparent"
                    />
                  </div>
                  <button className="btn-primary sm:px-6 py-2.5">
                    Search
                    <ArrowRight size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Popular: <Link className="hover:underline" href="/browse?q=shopify">Shopify</Link>,{' '}
                  <Link className="hover:underline" href="/browse?q=executive%20assistant">Executive Assistant</Link>,{' '}
                  <Link className="hover:underline" href="/browse?q=customer%20support">Customer Support</Link>
                </p>
              </form>

              <div className="mt-7 flex flex-wrap items-center gap-2 text-sm">
                <span className="badge-verified">
                  <CheckCircle size={13} className="text-emerald-600" />
                  Background checked
                </span>
                <span className="badge">Portfolio reviewed</span>
                <span className="badge">Skill score shown</span>
                <span className="badge">Response time tracked</span>
              </div>

              <div className="mt-7 flex items-center gap-3">
                <Link href="/browse" className="btn-primary">
                  Browse VAs
                  <ArrowRight size={16} />
                </Link>
                <Link href="/apply" className="btn-outline">
                  Apply as a VA
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="surface p-6">
                <p className="text-sm font-semibold text-gray-900">Featured this week</p>
                <p className="text-sm text-gray-600 mt-1">Top performers by skill score and response time.</p>
                <div className="mt-4 space-y-3">
                  {[
                    { name: 'Executive Assistant', meta: 'Inbox + calendar · 95% skill' },
                    { name: 'Shopify VA', meta: 'Product uploads · 92% skill' },
                    { name: 'Customer Support', meta: 'Zendesk · 2h response' },
                  ].map(x => (
                    <div key={x.name} className="flex items-center justify-between border border-gray-200/70 rounded-xl p-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{x.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{x.meta}</p>
                      </div>
                      <Star size={16} className="text-amber-500" />
                    </div>
                  ))}
                </div>
                <Link href="/browse" className="btn-outline w-full mt-5">
                  View all verified VAs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof numbers ── */}
      <section className="border-y border-gray-200/60 py-10 bg-white">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '480+', label: 'Verified VAs' },
            { value: '94%', label: 'Avg skill score' },
            { value: '3.2h', label: 'Avg time to first match' },
            { value: '78%', label: 'Client rehire rate' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-brand-500">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trusted by teams ── */}
      <section className="container py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 text-center">
          Trusted by operators from
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['E-commerce', 'SaaS', 'Agencies', 'Founders'].map(item => (
            <div key={item} className="surface bg-white/90 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="container py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
          <p className="text-gray-600 mt-2">A marketplace built for signal over noise.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {[
            { icon: ShieldCheck, title: 'VAs are tested first', desc: 'Every applicant completes skill tests, submits a portfolio, and passes a background check before their profile goes live.' },
            { icon: Search, title: 'You search, not sift', desc: 'Filter by skill, category, hourly rate, and availability. Every result is verified — no noise, no guessing.' },
            { icon: TrendingUp, title: 'Data grows smarter', desc: 'After every completed hire, delivery speed, communication scores, and rehire rates update automatically.' },
          ].map(step => (
            <div key={step.title} className="surface p-6">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 border border-brand-100">
                <step.icon size={22} className="text-brand-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-gray-50/60 border-y border-gray-200/60 py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900">Pricing</h2>
            <p className="text-gray-600 mt-2">Plus a 10% placement fee on first hire. No other surprises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div key={key} className={`bg-white rounded-2xl p-6 border ${key === 'pro' ? 'border-brand-100 shadow-sm' : 'border-gray-200/70'} hover:shadow-sm transition-shadow`}>
                {key === 'pro' && (
                  <div className="text-xs font-semibold bg-brand-600 text-white px-2 py-0.5 rounded-full inline-block mb-3">Most popular</div>
                )}
                <p className="font-semibold text-gray-900 text-lg">{plan.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 mb-1">${plan.price}<span className="text-base font-normal text-gray-400">/mo</span></p>
                <ul className="mt-4 space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className={key === 'pro' ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <div className="surface p-6 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">Are you a VA?</p>
              <p className="text-sm text-gray-600 mt-0.5">Get a verified badge and premium positioning for $29/month.</p>
            </div>
            <Link href="/apply" className="btn-outline">Apply as a VA</Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="container py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900">What teams say</h2>
          <p className="text-gray-600 mt-2">Fast matches, higher reliability, less hiring noise.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {[
            {
              quote: 'We hired a support VA in under 48 hours. The profile metrics were accurate and saved us a week of interviews.',
              who: 'COO, DTC brand',
            },
            {
              quote: 'The quality bar is real. We finally stopped sorting through random applicants and focused on execution.',
              who: 'Founder, SaaS startup',
            },
            {
              quote: 'Messaging and tracking in one place makes this feel like a proper hiring workflow, not just a directory.',
              who: 'Ops lead, agency',
            },
          ].map(t => (
            <article key={t.who} className="surface bg-white/95 p-5">
              <p className="text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.who}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200/60 py-10 bg-white">
        <div className="container grid md:grid-cols-3 gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-brand-500" />
            <span className="font-medium text-gray-900">ProvenVA</span>
          </div>
          <div className="flex gap-6 md:justify-center">
            <Link href="/browse" className="hover:text-gray-800">Browse</Link>
            <Link href="/apply" className="hover:text-gray-800">Apply</Link>
            <Link href="/pricing" className="hover:text-gray-800">Pricing</Link>
            <Link href="/terms" className="hover:text-gray-800">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-800">Privacy</Link>
            <Link href="/refunds" className="hover:text-gray-800">Refunds</Link>
          </div>
          <p className="md:text-right">© {new Date().getFullYear()} ProvenVA. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
