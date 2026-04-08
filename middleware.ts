// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/apply(.*)',
  '/onboarding(.*)',
])

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const secretKey = process.env.CLERK_SECRET_KEY

const clerkConfigured =
  typeof publishableKey === 'string' &&
  publishableKey.startsWith('pk_') &&
  !publishableKey.includes('xxxx') &&
  typeof secretKey === 'string' &&
  secretKey.startsWith('sk_') &&
  !secretKey.includes('xxxx')

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
