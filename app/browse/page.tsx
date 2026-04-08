// app/browse/page.tsx
import Navbar from '@/components/Navbar'
import VACard from '@/components/VACard'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/types'
import type { VA, VACategory } from '@/types'

interface SearchParams {
  category?: VACategory
  availability?: string
  min_rate?: string
  max_rate?: string
  q?: string
}

export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  // Build query
  let query = supabase
    .from('vas')
    .select('*')
    .eq('status', 'verified')
    .order('test_score', { ascending: false })

  if (searchParams.category) query = query.eq('category', searchParams.category)
  if (searchParams.availability) query = query.eq('availability', searchParams.availability)
  if (searchParams.min_rate) query = query.gte('hourly_rate_usd', parseInt(searchParams.min_rate))
  if (searchParams.max_rate) query = query.lte('hourly_rate_usd', parseInt(searchParams.max_rate))
  if (searchParams.q) query = query.ilike('headline', `%${searchParams.q}%`)

  const { data: vas } = await query as { data: VA[] | null }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50/60 border-b border-gray-200/60">
        <div className="container py-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Browse verified VAs</h1>
            <p className="text-gray-600 mt-2">
              Marketplace-style hiring: search fast, compare confidently, and contact only after you subscribe.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Filters sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="surface p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-900">Filters</p>
                <a href="/browse" className="text-sm text-gray-500 hover:text-gray-800">Reset</a>
              </div>

              <form className="space-y-5" action="/browse">
                <div>
                  <label className="label">Keyword</label>
                  <input name="q" defaultValue={searchParams.q} placeholder="e.g. Shopify, Notion..." className="input" />
                </div>

                <div>
                  <label className="label">Category</label>
                  <select name="category" defaultValue={searchParams.category ?? ''} className="input">
                    <option value="">All categories</option>
                    {Object.entries(CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Availability</label>
                  <select name="availability" defaultValue={searchParams.availability ?? ''} className="input capitalize">
                    <option value="">Any</option>
                    <option value="full_time">Full time</option>
                    <option value="part_time">Part time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="label">Hourly rate (USD)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input name="min_rate" defaultValue={searchParams.min_rate} placeholder="Min" className="input" inputMode="numeric" />
                    <input name="max_rate" defaultValue={searchParams.max_rate} placeholder="Max" className="input" inputMode="numeric" />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full">Apply filters</button>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Tip: start broad, then narrow by category + rate once you see profiles you like.
                </p>
              </form>
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{vas?.length ?? 0}</span> verified VAs
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Sorted by skill score (highest first).</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="badge">Background checked</span>
                <span className="badge">Skill tested</span>
              </div>
            </div>

            {vas && vas.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {vas.map(va => <VACard key={va.id} va={va} />)}
              </div>
            ) : (
              <div className="surface p-10 text-center">
                <p className="text-lg font-semibold text-gray-900 mb-1">No matches</p>
                <p className="text-sm text-gray-600">Try removing filters, or search a broader keyword.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
