import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Clerk v6 middleware style: define public route matcher, protect everything else
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/portal(.*)',
  '/images(.*)',
  '/chatbot',
  '/chat-test', // AI SDK 5 OpenAI test page
  '/chat-claude', // AI SDK 5 Claude test page
  '/chat-test-simple', // Simple fetch test
  '/favicon\\.ico',
  '/api/webhooks(.*)',
  '/api/dodo/webhook',
  '/api/dodo(.*)',
  // Allow public chatbot streaming + related bot APIs
  '/api/bot(.*)',
  '/api/chat-test', // AI SDK 5 OpenAI test API
  '/api/chat-claude', // AI SDK 5 Claude test API
  '/api/model-test' // AI SDK 5 model comparison API
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and test routes
    '/((?!_next|chat-test|chat-claude|chat-test-simple|model-compare|api/chat-test|api/chat-claude|api/model-test|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
