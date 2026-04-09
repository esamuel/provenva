// app/browse/page.tsx
import Navbar from '@/components/Navbar'
import VACard from '@/components/VACard'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/types'
import type { VA, VACategory } from '@/types'

const TOP_MATCH_SKILLS = [
  'Shopify',
  'Notion',
  'Zendesk',
  'QuickBooks',
  'Xero',
  'Customer support',
  'Executive assistant',
  'Calendar scheduling',
  'Email management',
  'Social media',
  'Data entry',
] as const

interface SearchParams {
  category?: VACategory
  availability?: string
  min_rate?: string
  max_rate?: string
  q?: string
  sort?: string
  page?: string
}

export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1') || 1)
  const pageSize = 24
  const limitPlusOne = pageSize + 1
  const offset = (page - 1) * pageSize

  const sort = searchParams.sort ?? (searchParams.q ? 'relevance' : 'skill_desc')

  let vasAll: VA[] = []
  let hasNext = false
  const hasPrev = page > 1
  let rpcErrorMessage: string | null = null
  let fallbackErrorMessage: string | null = null

  try {
    const { data, error } = await supabase.rpc('search_verified_vas', {
      p_q: searchParams.q ?? null,
      p_category: searchParams.category ?? null,
      p_availability: searchParams.availability ?? null,
      p_min_rate: searchParams.min_rate ? parseInt(searchParams.min_rate) : null,
      p_max_rate: searchParams.max_rate ? parseInt(searchParams.max_rate) : null,
      p_sort: sort,
      p_limit: limitPlusOne,
      p_offset: offset,
    })

    if (error) throw error

    vasAll = (data as VA[] | null) ?? []
    hasNext = vasAll.length > pageSize
  } catch (err: any) {
    rpcErrorMessage = err?.message ?? 'Unknown search RPC error'

    try {
      let q = supabase
        .from('vas')
        .select('*')
        .eq('status', 'verified')

      if (searchParams.category) q = q.eq('category', searchParams.category)
      if (searchParams.availability) q = q.eq('availability', searchParams.availability)
      if (searchParams.min_rate) q = q.gte('hourly_rate_usd', parseInt(searchParams.min_rate))
      if (searchParams.max_rate) q = q.lte('hourly_rate_usd', parseInt(searchParams.max_rate))
      if (searchParams.q?.trim()) {
        const term = searchParams.q.trim()
        q = q.or(`full_name.ilike.%${term}%,headline.ilike.%${term}%,bio.ilike.%${term}%`)
      }

      if (sort === 'rate_asc') q = q.order('hourly_rate_usd', { ascending: true })
      else if (sort === 'rate_desc') q = q.order('hourly_rate_usd', { ascending: false })
      else if (sort === 'response_asc') q = q.order('avg_response_hours', { ascending: true, nullsFirst: false })
      else if (sort === 'newest') q = q.order('created_at', { ascending: false })
      else q = q.order('test_score', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })

      const { data: fallbackData, error: fallbackErr } = await q.range(offset, offset + pageSize)
      if (fallbackErr) throw fallbackErr

      vasAll = (fallbackData as VA[] | null) ?? []
      hasNext = vasAll.length > pageSize
    } catch (fallbackErr: any) {
      fallbackErrorMessage = fallbackErr?.message ?? 'Unknown fallback search error'
      vasAll = []
      hasNext = false
    }
  }

  const vas = vasAll.slice(0, pageSize)

  const qs = new URLSearchParams()
  if (searchParams.q) qs.set('q', searchParams.q)
  if (searchParams.category) qs.set('category', searchParams.category)
  if (searchParams.availability) qs.set('availability', searchParams.availability)
  if (searchParams.min_rate) qs.set('min_rate', searchParams.min_rate)
  if (searchParams.max_rate) qs.set('max_rate', searchParams.max_rate)
  if (sort) qs.set('sort', sort)

  const topChips = (() => {
    const q = (searchParams.q ?? '').trim().toLowerCase()
    if (!q) return []
    const chips = TOP_MATCH_SKILLS.filter(s => !s.toLowerCase().includes(q)).slice(0, 6)
    return chips
  })()

  if (rpcErrorMessage && fallbackErrorMessage) {
    return (
      <>
        <Navbar />
        <div className="container py-16">
          <div className="surface p-8 max-w-xl">
            <h1 className="text-xl font-bold text-gray-900">Search unavailable</h1>
            <p className="text-sm text-gray-600 mt-2">
              Search RPC failed and fallback query also failed. Confirm Supabase URL/keys match this project and the database is reachable. Then run the latest{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">supabase-schema.sql</code>.
            </p>
            <p className="text-xs text-gray-500 mt-3 font-mono break-all">RPC: {rpcErrorMessage}</p>
            <p className="text-xs text-gray-500 mt-1 font-mono break-all">Fallback: {fallbackErrorMessage}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="border-b border-slate-200/70 bg-[radial-gradient(ellipse_at_top,rgba(59,85,230,0.10),transparent_60%)]">
        <div className="container py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Browse verified VAs</h1>
            <p className="mt-2 text-slate-600">
              Marketplace-style hiring: search fast, compare confidently, and contact only after you subscribe.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Filters sidebar */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="surface p-5 bg-white/95">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-900">Filters</p>
                <a href="/browse" className="text-sm text-slate-500 hover:text-slate-800">Reset</a>
              </div>

              <details className="lg:hidden mb-4">
                <summary className="btn-outline w-full cursor-pointer list-none justify-center">
                  Open quick filters
                </summary>
                <form className="space-y-4 mt-3" action="/browse">
                  <input type="hidden" name="sort" value={sort} />
                  <input type="hidden" name="page" value="1" />
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
                  <button type="submit" className="btn-primary w-full">Apply filters</button>
                </form>
              </details>

              <form className="space-y-5 hidden lg:block" action="/browse">
                <input type="hidden" name="sort" value={sort} />
                <input type="hidden" name="page" value="1" />
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
                <p className="text-xs leading-relaxed text-slate-500">
                  Tip: start broad, then narrow by category + rate once you see profiles you like.
                </p>
              </form>
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{vas.length}</span> results on this page
                </p>
                <p className="mt-0.5 text-xs capitalize text-slate-500">
                  Sorted by {sort.replace('_', ' ')} • Page {page}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="badge">Background checked</span>
                  <span className="badge">Skill tested</span>
                </div>
                <form action="/browse" className="flex items-center gap-2">
                  {/* preserve filters */}
                  {Array.from(qs.entries()).map(([k, v]) =>
                    k === 'sort' || k === 'page' ? null : <input key={k} type="hidden" name={k} value={v} />
                  )}
                  <label className="hidden text-sm text-slate-600 sm:block">Sort</label>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className="input py-2.5"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="skill_desc">Skill score</option>
                    <option value="rate_asc">Rate: low to high</option>
                    <option value="rate_desc">Rate: high to low</option>
                    <option value="response_asc">Response time</option>
                    <option value="newest">Newest</option>
                  </select>
                  <input type="hidden" name="page" value="1" />
                  <button className="btn-outline hidden sm:inline-flex" type="submit">Apply</button>
                </form>
              </div>
            </div>

            {topChips.length > 0 && (
              <div className="mb-5 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm shadow-slate-200/50">
                <p className="mb-2 text-xs font-semibold text-slate-600">Top matches</p>
                <div className="flex flex-wrap gap-2">
                  {topChips.map(chip => {
                    const p = new URLSearchParams(qs)
                    p.set('q', chip)
                    p.set('page', '1')
                    return (
                      <a key={chip} href={`/browse?${p.toString()}`} className="badge hover:bg-slate-50">
                        {chip}
                      </a>
                    )
                  })}
                  {!searchParams.category && (
                    <a
                      href="/browse?category=admin&sort=skill_desc&page=1"
                      className="badge hover:bg-slate-50"
                    >
                      Admin Support
                    </a>
                  )}
                </div>
              </div>
            )}

            {vas.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {vas.map(va => <VACard key={va.id} va={va} />)}
              </div>
            ) : (
              <div className="surface bg-white/95 p-10 text-center">
                <p className="mb-1 text-lg font-semibold text-slate-900">No matches</p>
                <p className="text-sm text-slate-600">Try removing filters, or search a broader keyword.</p>
              </div>
            )}

            {(hasPrev || hasNext) && (
              <div className="flex items-center justify-between mt-8">
                <a
                  className={hasPrev ? 'btn-outline' : 'btn-outline opacity-40 pointer-events-none'}
                  href={`/browse?${(() => {
                    const p = new URLSearchParams(qs)
                    p.set('page', String(page - 1))
                    return p.toString()
                  })()}`}
                >
                  Previous
                </a>
                <span className="text-sm text-gray-600">Page {page}</span>
                <a
                  className={hasNext ? 'btn-outline' : 'btn-outline opacity-40 pointer-events-none'}
                  href={`/browse?${(() => {
                    const p = new URLSearchParams(qs)
                    p.set('page', String(page + 1))
                    return p.toString()
                  })()}`}
                >
                  Next
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
