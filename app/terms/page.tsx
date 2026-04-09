import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Terms of Service | ProvenVA',
  description: 'Terms of Service for ProvenVA marketplace users.',
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="container py-12">
        <article className="surface mx-auto max-w-3xl bg-white/95 p-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-500">Effective date: April 9, 2026</p>

          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. Service overview</h2>
              <p>
                ProvenVA provides a marketplace where businesses can discover, contact, and hire virtual
                assistants. We may update features, pricing, and plan limits over time.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">2. Accounts and eligibility</h2>
              <p>
                You are responsible for account security and for all activity under your account. You must
                provide accurate information during sign-up and billing verification.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">3. Subscriptions and billing</h2>
              <p>
                Paid features are billed monthly unless otherwise stated. Subscriptions renew automatically
                until canceled. Taxes may apply based on your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">4. Marketplace conduct</h2>
              <p>
                Users must not use the platform for unlawful, deceptive, abusive, or fraudulent behavior.
                ProvenVA may suspend or remove accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">5. Limitation of liability</h2>
              <p>
                ProvenVA is provided on an as-is basis. To the maximum extent permitted by law, we are not
                liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">6. Contact</h2>
              <p>
                For support or legal notices, contact: <span className="font-medium">support@provenva.com</span>
              </p>
            </section>
          </div>
        </article>
      </main>
    </>
  )
}
