import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Clerk v6 middleware style: define public route matcher, protect everything else
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/portal(.*)',
  '/images(.*)',
  '/chatbot',
  '/favicon\\.ico',
  '/api/webhooks(.*)',
  '/api/dodo/webhook',
  '/api/dodo(.*)',
  // Allow public chatbot streaming + related bot APIs
  '/api/bot(.*)',
  // Public upload proxy for chatbot image uploads
  '/api/upload'
])

export default clerkMiddleware(async (auth, req) => {
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
