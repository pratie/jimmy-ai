import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Clerk v6 middleware style: define public route matcher, protect everything else
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/portal(.*)',
  '/images(.*)',
  '/chatbot',
  // Public preview so you can share a link
  '/preview(.*)',
  // Make blogs public for SEO
  '/blogs(.*)',
  '/favicon\\.ico',
  // SEO metadata routes must be public
  '/robots\\.txt',
  '/sitemap\\.xml',
  '/api/webhooks(.*)',
  '/api/dodo/webhook',
  '/api/dodo(.*)',
  // Allow public chatbot streaming + related bot APIs
  '/api/bot(.*)',
  // Public upload proxy for chatbot image uploads
  '/api/upload'
])

export default clerkMiddleware(async (auth, req) => {
  // Redirect unauthenticated users hitting /dashboard?plan=... to public sign-up with plan
  try {
    const url = req.nextUrl
    if (url.pathname === '/dashboard') {
      const plan = url.searchParams.get('plan')
      const billing = url.searchParams.get('billing')
      const isAuthed = Boolean((auth as any)?.userId)
      if (!isAuthed && plan) {
        const target = new URL('/auth/sign-up', url)
        target.searchParams.set('plan', plan)
        if (billing) target.searchParams.set('billing', billing)
        return NextResponse.redirect(target, 302)
      }
    }
  } catch (_) {
    // best-effort; fall through to normal protection
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
