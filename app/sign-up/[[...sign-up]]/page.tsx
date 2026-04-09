import { SignUp } from '@clerk/nextjs'

export default function Page({
  searchParams,
}: {
  searchParams: { redirect_url?: string }
}) {
  const nextUrl = searchParams.redirect_url ?? '/onboarding'
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50/60">
      <SignUp forceRedirectUrl={nextUrl} />
    </div>
  )
}

