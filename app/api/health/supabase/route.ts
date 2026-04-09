import { NextResponse } from 'next/server'

function validSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}

export async function GET() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()

  if (!validSupabaseUrl(url)) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'Invalid NEXT_PUBLIC_SUPABASE_URL. Use the exact Project URL from Supabase Settings > API.',
      },
      { status: 500 }
    )
  }

  const anonLooksPresent = !!anon && anon.length >= 20 && !anon.includes('xxxx')
  if (!anonLooksPresent) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'Missing/invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy the key from Supabase Settings > API.',
      },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(`${url}/rest/v1/vas?select=id&limit=1`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return NextResponse.json(
        {
          ok: false,
          reason: `Supabase reachable but returned HTTP ${res.status}. ${body ? body.slice(0, 180) : 'Check keys/project and table access.'}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const msg = err?.cause?.code ? `${err.cause.code}` : err?.message ?? 'Unknown network error'
    return NextResponse.json(
      {
        ok: false,
        reason: `Supabase network error: ${msg}. Check project URL DNS/connectivity.`,
      },
      { status: 500 }
    )
  }
}
