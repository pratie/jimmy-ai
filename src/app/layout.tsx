import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/them-provider'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'BookmyLead AI - AI Agent Trained on Your Company Data',
  description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep. Turn visitors into customers automatically.',
  keywords: ['AI chatbot', 'AI agent', 'lead generation', 'customer support automation', 'conversational AI', 'business automation', 'BookmyLead AI'],
  authors: [{ name: 'BookmyLead AI' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/images/logo.svg', type: 'image/svg+xml' }
    ],
    apple: '/apple-icon.svg',
    shortcut: '/images/logo.svg',
  },
  openGraph: {
    title: 'BookmyLead AI - AI Agent Trained on Your Company Data',
    description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep.',
    type: 'website',
    images: [{ url: '/images/logo.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookmyLead AI - AI Agent Trained on Your Company Data',
    description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep.',
    images: ['/images/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${spaceGrotesk.className} landing-gradient min-h-screen`}>
          {/* DataFast Analytics - Must be in body for Next.js Script component */}
          <Script
            defer
            data-website-id="68eaf4123d3dccc2e466bf8c"
            data-domain="www.bookmylead.app"
            src="https://datafa.st/js/script.js"
            strategy="afterInteractive"
          />

          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
