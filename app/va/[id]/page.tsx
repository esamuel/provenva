// app/va/[id]/page.tsx
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/types'
import type { VA } from '@/types'
import { CheckCircle, Star, Clock, RefreshCw, Globe, Linkedin, ExternalLink } from 'lucide-react'

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
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Left: Profile info */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 font-bold text-xl flex-shrink-0">
                {va.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{va.full_name}</h1>
                  <span className="badge-verified">
                    <CheckCircle size={11} /> Verified
                  </span>
                </div>
                <p className="text-gray-500">{CATEGORIES[va.category]} · {va.country} · {va.timezone}</p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{va.bio}</p>

            {/* Skills */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {va.skills.map(skill => (
                  <span key={skill} className="text-sm bg-gray-50 text-gray-700 px-3 py-1 rounded-full border border-gray-100">{skill}</span>
                ))}
              </div>
            </div>

            {/* Performance stats */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Verified performance</h2>
              <div className="grid grid-cols-3 gap-4">
                {va.test_score !== null && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-brand-500">{va.test_score}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Skill test score</p>
                  </div>
                )}
                {va.rehire_rate !== null && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-500">{va.rehire_rate}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Rehire rate</p>
                  </div>
                )}
                {va.avg_response_hours !== null && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{va.avg_response_hours}h</p>
                    <p className="text-xs text-gray-500 mt-0.5">Avg response</p>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-4">
              {va.portfolio_url && (
                <a href={va.portfolio_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 text-sm text-brand-500 hover:underline">
                  <ExternalLink size={14} /> Portfolio
                </a>
              )}
              {va.linkedin_url && (
                <a href={va.linkedin_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 text-sm text-brand-500 hover:underline">
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Right: Hire card */}
          <div>
            <div className="card sticky top-20">
              <p className="text-2xl font-bold text-gray-900 mb-0.5">${va.hourly_rate_usd}<span className="text-base font-normal text-gray-400">/hr</span></p>
              <p className="text-sm text-gray-500 mb-4 capitalize">{va.availability.replace('_', ' ')} · {va.years_experience} yrs exp</p>
              <a href="/sign-up" className="btn-primary w-full justify-center mb-3">Contact this VA</a>
              <p className="text-xs text-gray-400 text-center">Subscribe to unlock contact info</p>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completed jobs</span>
                  <span className="font-medium">{va.completed_jobs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-medium">{va.years_experience} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{va.country}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
