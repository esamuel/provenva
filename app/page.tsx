// app/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CheckCircle, Search, ShieldCheck, TrendingUp, Star } from 'lucide-react'
import { PLANS } from '@/types'

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <CheckCircle size={12} />
          Every VA is skill-tested before you see them
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-5 max-w-3xl mx-auto">
          Hire virtual assistants who are already <span className="text-brand-500">proven</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Stop sifting through 50 proposals. Every VA on ProvenVA has passed skill tests, background checks, and portfolio reviews — before you arrive.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/browse" className="btn-primary text-base px-6 py-3">Browse verified VAs</Link>
          <Link href="/apply" className="btn-outline text-base px-6 py-3">Apply as a VA</Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No commitment. Browse free.</p>
      </section>

      {/* ── Social proof numbers ── */}
      <section className="border-y border-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How ProvenVA works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: 'VAs are tested first', desc: 'Every applicant completes skill tests, submits a portfolio, and passes a background check before their profile goes live.' },
            { icon: Search, title: 'You search, not sift', desc: 'Filter by skill, category, hourly rate, and availability. Every result is verified — no noise, no guessing.' },
            { icon: TrendingUp, title: 'Data grows smarter', desc: 'After every completed hire, delivery speed, communication scores, and rehire rates update automatically.' },
          ].map(step => (
            <div key={step.title} className="text-center">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <step.icon size={22} className="text-brand-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Simple pricing</h2>
          <p className="text-center text-gray-500 mb-12 text-sm">Plus a 10% placement fee on first hire. No other surprises.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div key={key} className={`bg-white rounded-xl p-6 border ${key === 'pro' ? 'border-brand-500 shadow-sm' : 'border-gray-100'}`}>
                {key === 'pro' && (
                  <div className="text-xs font-medium bg-brand-500 text-white px-2 py-0.5 rounded-full inline-block mb-3">Most popular</div>
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
          <p className="text-center text-sm text-gray-400 mt-8">
            Are you a VA? <Link href="/apply" className="text-brand-500 hover:underline">Apply for a verified badge — $29/month</Link>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-brand-500" />
            <span className="font-medium text-gray-900">ProvenVA</span>
          </div>
          <div className="flex gap-6">
            <Link href="/browse" className="hover:text-gray-600">Browse</Link>
            <Link href="/apply" className="hover:text-gray-600">Apply</Link>
            <Link href="/#pricing" className="hover:text-gray-600">Pricing</Link>
          </div>
          <p>© {new Date().getFullYear()} ProvenVA. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
