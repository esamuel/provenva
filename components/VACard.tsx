// components/VACard.tsx
import Link from 'next/link'
import { CheckCircle, Star, Clock, RefreshCw, MapPin } from 'lucide-react'
import type { VA } from '@/types'
import { CATEGORIES } from '@/types'

export default function VACard({ va }: { va: VA }) {
  return (
    <Link
      href={`/va/${va.id}`}
      className="group block bg-white border border-gray-200/70 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-brand-50 to-white border border-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
          {va.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate group-hover:text-brand-700 transition-colors">{va.full_name}</p>
            {va.status === 'verified' && (
              <span className="badge-verified">
                <CheckCircle size={13} className="text-emerald-600" />
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{va.headline}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="badge">{CATEGORIES[va.category]}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {va.country}
            </span>
            <span className="capitalize">{va.availability.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm text-gray-500">Rate</p>
          <p className="font-bold text-gray-900 text-base">${va.hourly_rate_usd}/hr</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {va.skills.slice(0, 4).map(skill => (
          <span key={skill} className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200/70">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-4 mt-4 border-t border-gray-100 text-xs text-gray-600">
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
