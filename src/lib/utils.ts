import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractUUIDFromString = (url: string) => {
  return url.match(
    /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i
  )
}

// ⚠️ Pusher has been moved to separate files for security:
// - Server: import { pusherServer } from '@/lib/pusher-server' (server actions only)
// - Client: import { pusherClient } from '@/lib/pusher-client' (client components)

// Send dimension updates to parent window
// Note: Uses wildcard '*' origin because iframe can be embedded on any customer domain
// This is safe - only sends non-sensitive dimension data: {width: number, height: number}
export const postToParent = (message: string) => {
  window.parent.postMessage(message, '*')
}

export const extractURLfromString = (url: string) => {
  return url.match(/https?:\/\/[^\s"<>]+/)
}

export const extractEmailsFromString = (text: string) => {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
}

export const getMonthName = (month: number) => {
  return month == 1
    ? 'Jan'
    : month == 2
    ? 'Feb'
    : month == 3
    ? 'Mar'
    : month == 4
    ? 'Apr'
    : month == 5
    ? 'May'
    : month == 6
    ? 'Jun'
    : month == 7
    ? 'Jul'
    : month == 8
    ? 'Aug'
    : month == 9
    ? 'Sep'
    : month == 10
    ? 'Oct'
    : month == 11
    ? 'Nov'
    : month == 12 && 'Dec'
}

// Production-safe logging utilities
// In production, these prevent PII (emails, domain names, etc.) from being logged
const isProd = process.env.NODE_ENV === 'production'

export const devLog = (...args: any[]) => {
  if (!isProd) {
    console.log(...args)
  }
}

export const devError = (...args: any[]) => {
  if (!isProd) {
    console.error(...args)
  } else {
    // In production, only log generic error messages without PII
    console.error('An error occurred. Enable development mode for details.')
  }
}

export const devWarn = (...args: any[]) => {
  if (!isProd) {
    console.warn(...args)
  }
}
