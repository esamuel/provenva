// app/va/[id]/page.tsx
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/types'
import type { VA } from '@/types'
import { CheckCircle, Linkedin, ExternalLink, MapPin, Briefcase, Clock } from 'lucide-react'

export default async function VAProfilePage({ params }: { params: { id: string } }) {
  const { data: va } = await supabase
    .from('vas')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'verified')
    .single() as { data: VA | null }

  if (!va) notFound()

  return (
    <>
      <Navbar />
      <div className="bg-gray-50/60 border-b border-gray-200/60">
        <div className="container py-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-brand-50 to-white border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl flex-shrink-0">
              {va.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{va.full_name}</h1>
                <span className="badge-verified">
                  <CheckCircle size={13} className="text-emerald-600" /> Verified
                </span>
              </div>
              <p className="text-gray-600 mt-1">{va.headline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="badge">{CATEGORIES[va.category]}</span>
                <span className="badge inline-flex items-center gap-1">
                  <MapPin size={13} /> {va.country}
                </span>
                <span className="badge inline-flex items-center gap-1">
                  <Briefcase size={13} /> {va.years_experience} yrs exp
                </span>
                {va.avg_response_hours !== null && (
                  <span className="badge inline-flex items-center gap-1">
                    <Clock size={13} /> {va.avg_response_hours}h response
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">

          {/* Left: Profile info */}
          <div className="space-y-6 min-w-0">
            <div className="surface p-6">
              <p className="text-sm font-semibold text-gray-900">About</p>
              <p className="text-gray-700 leading-relaxed mt-3 whitespace-pre-line">{va.bio}</p>
            </div>

            {/* Skills */}
            <div className="surface p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {va.skills.map(skill => (
                  <span key={skill} className="text-sm bg-gray-50 text-gray-800 px-3 py-1 rounded-full border border-gray-200/70">{skill}</span>
                ))}
              </div>
            </div>

            {/* Performance stats */}
            <div className="surface p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Verified performance</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {va.test_score !== null && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200/70">
                    <p className="text-2xl font-bold text-gray-900">{va.test_score}%</p>
                    <p className="text-xs text-gray-600 mt-1">Skill score</p>
                  </div>
                )}
                {va.rehire_rate !== null && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200/70">
                    <p className="text-2xl font-bold text-gray-900">{va.rehire_rate}%</p>
                    <p className="text-xs text-gray-600 mt-1">Rehire rate</p>
                  </div>
                )}
                {va.avg_response_hours !== null && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200/70">
                    <p className="text-2xl font-bold text-gray-900">{va.avg_response_hours}h</p>
                    <p className="text-xs text-gray-600 mt-1">Avg response</p>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            {(va.portfolio_url || va.linkedin_url) && (
              <div className="surface p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Links</h2>
                <div className="flex flex-wrap gap-3">
                  {va.portfolio_url && (
                    <a
                      href={va.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                    >
                      <ExternalLink size={16} /> Portfolio
                    </a>
                  )}
                  {va.linkedin_url && (
                    <a
                      href={va.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                    >
                      <Linkedin size={16} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Hire card */}
          <div>
            <div className="surface p-6 sticky top-24">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-600">Hourly rate</p>
                  <p className="text-3xl font-bold text-gray-900">${va.hourly_rate_usd}<span className="text-base font-normal text-gray-400">/hr</span></p>
                </div>
                <span className="badge capitalize">{va.availability.replace('_', ' ')}</span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed jobs</span>
                  <span className="font-semibold text-gray-900">{va.completed_jobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold text-gray-900">{va.years_experience} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Timezone</span>
                  <span className="font-semibold text-gray-900">{va.timezone}</span>
                </div>
              </div>

              <div className="mt-5">
                <a href="/sign-up" className="btn-primary w-full">Contact this VA</a>
                <p className="text-xs text-gray-500 text-center mt-2">Subscribe to unlock contact info</p>
              </div>

              <div className="mt-5 border-t border-gray-200/60 pt-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  You’ll see real metrics (skill score, response time, rehire rate) so you can shortlist faster.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
