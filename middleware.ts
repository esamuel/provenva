// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isClerkPublishableKeyValid } from '@/lib/clerk-config'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/apply(.*)',
  '/onboarding(.*)',
])

const clerkConfigured = isClerkPublishableKeyValid(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default clerkConfigured
  ? clerkMiddleware((auth, req) => {
      if (isProtected(req)) auth().protect()
    })
  : function middleware() {
      // Allow the app to boot before Clerk is configured.
      return NextResponse.next()
    }

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
