import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/them-provider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://chatdock.io').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'ChatDock AI - AI Agent Trained on Your Company Data',
  description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep. Turn visitors into customers automatically.',
  keywords: ['AI chatbot', 'AI agent', 'lead generation', 'customer support automation', 'conversational AI', 'business automation', 'ChatDock AI'],
  authors: [{ name: 'ChatDock AI' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/images/logo.svg', type: 'image/svg+xml' }
    ],
    apple: '/apple-icon.svg',
    shortcut: '/images/logo.svg',
  },
  openGraph: {
    title: 'ChatDock AI - AI Agent Trained on Your Company Data',
    description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep.',
    type: 'website',
    images: [
      {
        url: `${APP_URL}/images/social_graph_img.png`,
        width: 1200,
        height: 630,
        alt: 'ChatDock · Website AI Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatDock AI - AI Agent Trained on Your Company Data',
    description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep.',
    images: [`${APP_URL}/images/social_graph_img.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans min-h-screen antialiased`}>
          {/* DataFast Analytics - Must be in body for Next.js Script component */}
          <Script
            defer
            data-website-id="dfid_8E14zpXFdL9r5htqEUbhI"
            data-domain="chatdock.io"
            src="https://datafa.st/js/script.js"
            strategy="afterInteractive"
          />

          {/* Leadsy Pixel */}
          <Script
            id="vtag-ai-js"
            async
            src="https://r2.leadsy.ai/tag.js"
            data-pid="19yiPsmzWcmPcmZmm"
            data-version="062024"
            strategy="afterInteractive"
          />

          {/* Organization JSON-LD */}
          <Script id="ld-organization" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ChatDock AI',
              url: APP_URL,
              logo: `${APP_URL}/images/logo.svg`,
            })}
          </Script>

          {/* SoftwareApplication (SaaS) JSON-LD */}
          <Script id="ld-software" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'ChatDock AI',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              url: APP_URL,
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                description: 'Free trial available',
              },
            })}
          </Script>

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
