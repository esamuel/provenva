import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Privacy Policy | ProvenVA',
  description: 'Privacy policy for ProvenVA users and visitors.',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container py-12">
        <article className="surface mx-auto max-w-3xl bg-white/95 p-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Effective date: April 9, 2026</p>

          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. Information we collect</h2>
              <p>
                We collect account details, profile information, billing identifiers, and usage data needed
                to operate the marketplace and improve product quality.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">2. How we use information</h2>
              <p>
                We use data to authenticate users, provide matching and messaging features, process
                subscriptions, prevent fraud, and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">3. Sharing and processors</h2>
              <p>
                We share data only with trusted service providers required for platform operation, including
                hosting, authentication, database, and billing providers.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">4. Data retention</h2>
              <p>
                We retain personal data for as long as needed to provide services, resolve disputes, and
                satisfy legal requirements. You can request account deletion at any time.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">5. Your rights</h2>
              <p>
                Depending on your jurisdiction, you may have rights to access, correct, export, or delete
                your personal data. Contact us to submit a privacy request.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">6. Contact</h2>
              <p>
                Privacy inquiries: <span className="font-medium">privacy@provenva.com</span>
              </p>
            </section>
          </div>
        </article>
      </main>
    </>
  )
}
