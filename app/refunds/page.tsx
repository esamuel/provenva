import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Refund Policy | ProvenVA',
  description: 'Refund policy for ProvenVA subscriptions.',
}

export default function RefundsPage() {
  return (
    <>
      <Navbar />
      <main className="container py-12">
        <article className="surface mx-auto max-w-3xl bg-white/95 p-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Refund Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Effective date: April 9, 2026</p>

          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. Subscription charges</h2>
              <p>
                ProvenVA subscriptions are billed monthly in advance. Charges are non-refundable except as
                required by law or where explicitly stated in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">2. First-charge refund window</h2>
              <p>
                New business subscriptions may request a refund within 7 days of the first charge if no
                meaningful platform usage has occurred (for example, no active hiring conversations).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">3. Renewals and cancellation</h2>
              <p>
                You can cancel at any time through the billing portal. Cancellation stops future renewals
                and takes effect at the end of the current paid cycle.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">4. Charge disputes</h2>
              <p>
                If you believe a charge is incorrect, contact us first so we can review and resolve quickly.
                We may request account details and billing receipts.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">5. Contact</h2>
              <p>
                Refund requests: <span className="font-medium">billing@provenva.com</span>
              </p>
            </section>
          </div>
        </article>
      </main>
    </>
  )
}
