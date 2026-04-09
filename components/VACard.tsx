// components/VACard.tsx
import Link from 'next/link'
import { CheckCircle, Star, Clock, RefreshCw, MapPin } from 'lucide-react'
import type { VA } from '@/types'
import { CATEGORIES } from '@/types'

export default function VACard({ va }: { va: VA }) {
  return (
    <Link
      href={`/va/${va.id}`}
      className="group block rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm shadow-slate-200/70 transition-all hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 flex-shrink-0 rounded-2xl border border-brand-100 bg-gradient-to-b from-brand-50 to-white flex items-center justify-center text-sm font-semibold text-brand-700">
          {va.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-slate-900 transition-colors group-hover:text-brand-700">{va.full_name}</p>
            {va.status === 'verified' && (
              <span className="badge-verified">
                <CheckCircle size={13} className="text-emerald-600" />
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">{va.headline}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="badge">{CATEGORIES[va.category]}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {va.country}
            </span>
            <span className="capitalize">{va.availability.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Rate</p>
          <p className="text-base font-bold text-slate-900">${va.hourly_rate_usd}/hr</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {va.skills.slice(0, 4).map(skill => (
          <span key={skill} className="rounded-full border border-slate-200/70 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-700">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600">
        {va.test_score !== null && (
          <span className="flex items-center gap-1">
            <Star size={12} className="text-amber-500" />
            {va.test_score}% skill
          </span>
        )}
        {va.rehire_rate !== null && (
          <span className="flex items-center gap-1">
            <RefreshCw size={12} />
            {va.rehire_rate}% rehire
          </span>
        )}
        {va.avg_response_hours !== null && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {va.avg_response_hours}h response
          </span>
        )}
      </div>
    </Link>
  )
}
