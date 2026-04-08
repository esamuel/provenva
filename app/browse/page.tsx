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
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse verified VAs</h1>
          <p className="text-gray-500 text-sm">Every profile below has passed skill tests and background checks.</p>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <aside className="w-56 flex-shrink-0">
            <form className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
                <div className="space-y-1">
                  <a href="/browse" className="block text-sm text-gray-600 hover:text-brand-500 py-0.5">All categories</a>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <a key={key} href={`/browse?category=${key}`}
                       className={`block text-sm py-0.5 ${searchParams.category === key ? 'text-brand-500 font-medium' : 'text-gray-600 hover:text-brand-500'}`}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Availability</p>
                <div className="space-y-1">
                  {['full_time', 'part_time', 'contract'].map(a => (
                    <a key={a} href={`/browse?availability=${a}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                       className="block text-sm text-gray-600 hover:text-brand-500 py-0.5 capitalize">
                      {a.replace('_', ' ')}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hourly rate</p>
                <div className="flex gap-2 items-center">
                  <input name="min_rate" defaultValue={searchParams.min_rate} placeholder="Min" className="input w-full text-xs py-1.5" />
                  <span className="text-gray-400 text-xs">–</span>
                  <input name="max_rate" defaultValue={searchParams.max_rate} placeholder="Max" className="input w-full text-xs py-1.5" />
                </div>
                <button type="submit" className="btn-primary w-full justify-center mt-2 py-1.5 text-xs">Apply</button>
              </div>
            </form>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{vas?.length ?? 0} verified VAs found</p>
              <input
                placeholder="Search by skill or keyword..."
                defaultValue={searchParams.q}
                className="input w-64 text-sm"
              />
            </div>

            {vas && vas.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {vas.map(va => <VACard key={va.id} va={va} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-medium mb-1">No VAs found</p>
                <p className="text-sm">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
