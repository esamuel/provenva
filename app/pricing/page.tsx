import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { PLANS } from '@/types'

export const metadata = {
  title: 'Pricing | ProvenVA',
  description: 'ProvenVA pricing plans for businesses and virtual assistants.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="container py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pricing</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose a plan that fits your hiring volume. Browse is free. Messaging and
            contact access require an active business plan.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Object.entries(PLANS).map(([key, plan]) => (
            <section
              key={key}
              className={`surface bg-white/95 p-5 ${
                key === 'pro' ? 'border-brand-100 shadow-sm' : ''
              }`}
            >
              {key === 'pro' && (
                <p className="mb-2 inline-flex rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
                  Most popular
                </p>
              )}
              <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                ${plan.price}
                <span className="text-base font-normal text-slate-500">/mo</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Up to {plan.vas} new VA contacts per month</p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
              <Link href="/sign-up" className="btn-primary mt-5 w-full justify-center">
                Get started
              </Link>
            </section>
          ))}
        </div>

        <section className="surface mt-8 bg-white/95 p-5">
          <h2 className="text-lg font-semibold text-slate-900">VA verified badge</h2>
          <p className="mt-1 text-sm text-slate-700">
            Verified VAs can opt into premium positioning for <strong>$29/month</strong>.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Taxes may apply by region. All subscriptions renew monthly until canceled.
          </p>
        </section>
      </main>
    </>
  )
}
