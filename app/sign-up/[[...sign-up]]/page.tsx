import { SignUp } from '@clerk/nextjs'
import { clerkEnabled } from '@/lib/clerk-config'

export default function Page({
  searchParams,
}: {
  searchParams: { redirect_url?: string }
}) {
  if (!clerkEnabled) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50/60">
        <div className="surface p-6 max-w-lg">
          <h1 className="text-xl font-bold text-slate-900">Authentication not configured</h1>
          <p className="text-sm text-slate-600 mt-2">
            Set real Clerk keys in <code className="text-xs bg-gray-100 px-1 rounded">.env.local</code>:
            <code className="text-xs bg-gray-100 px-1 rounded ml-1">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and
            <code className="text-xs bg-gray-100 px-1 rounded ml-1">CLERK_SECRET_KEY</code>.
          </p>
        </div>
      </div>
    )
  }

  const nextUrl = searchParams.redirect_url ?? '/onboarding'
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50/60">
      <SignUp forceRedirectUrl={nextUrl} />
    </div>
  )
}

