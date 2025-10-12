// Client-side Pusher instance
// Safe to import in client components and hooks

import PusherClient from 'pusher-js'

// Handle case where env vars aren't set during build time (SSR/prerendering)
// At runtime, this will be populated correctly
const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || ''
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'ap2'

// Only throw error in browser context, not during build
if (typeof window !== 'undefined' && (!pusherKey || !pusherCluster)) {
  throw new Error('Missing Pusher client environment variables. Please check NEXT_PUBLIC_PUSHER_APP_KEY and NEXT_PUBLIC_PUSHER_APP_CLUSTER.')
}

export const pusherClient = new PusherClient(
  pusherKey,
  {
    cluster: pusherCluster,
  }
)
