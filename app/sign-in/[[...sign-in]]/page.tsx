import { SignIn } from '@clerk/nextjs'

export default function Page({
  searchParams,
}: {
  searchParams: { redirect_url?: string }
}) {
  const nextUrl = searchParams.redirect_url ?? '/dashboard/business'
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50/60">
      <SignIn forceRedirectUrl={nextUrl} />
    </div>
  )
}

