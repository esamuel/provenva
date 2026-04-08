// components/VACard.tsx
import Link from 'next/link'
import { CheckCircle, Star, Clock, RefreshCw } from 'lucide-react'
import type { VA } from '@/types'
import { CATEGORIES } from '@/types'

export default function VACard({ va }: { va: VA }) {
  return (
    <Link href={`/va/${va.id}`} className="card block group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 font-semibold text-sm flex-shrink-0">
          {va.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-gray-900 truncate">{va.full_name}</p>
            {va.status === 'verified' && (
              <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500">{CATEGORIES[va.category]}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-semibold text-gray-900 text-sm">${va.hourly_rate_usd}/hr</p>
          <p className="text-xs text-gray-400">{va.availability.replace('_', ' ')}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{va.headline}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {va.skills.slice(0, 4).map(skill => (
          <span key={skill} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-gray-50 text-xs text-gray-500">
        {va.test_score !== null && (
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-400" />
            {va.test_score}% skill score
          </span>
        )}
        {va.rehire_rate !== null && (
          <span className="flex items-center gap-1">
            <RefreshCw size={11} />
            {va.rehire_rate}% rehire rate
          </span>
        )}
        {va.avg_response_hours !== null && (
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {va.avg_response_hours}h response
          </span>
        )}
      </div>
    </Link>
  )
}
