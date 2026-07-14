import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/them-provider'
import { AgentProvider } from '@/context/agent-context'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})


const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://chatdock.io').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'ChatDock — AI Delivery OS for Agencies',
  description: 'Launch, manage, test, and prove the value of white-label AI agents for every client from one agency workspace.',
  keywords: ['AI agency platform', 'white-label AI agent', 'website chatbot', 'lead qualification', 'client chatbot management', 'ChatDock'],
  authors: [{ name: 'ChatDock' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/images/logo.svg', type: 'image/svg+xml' }
    ],
    apple: '/apple-icon.svg',
    shortcut: '/images/logo.svg',
  },
  openGraph: {
    title: 'ChatDock — AI Delivery OS for Agencies',
    description: 'Launch and manage white-label client AI agents from one connected workspace.',
    type: 'website',
    images: [
      {
        url: `${APP_URL}/images/social_graph_img.png`,
        width: 1200,
        height: 630,
        alt: 'ChatDock agency workspace',
      },
    ],
    url: APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatDock — AI Delivery OS for Agencies',
    description: 'Launch and manage white-label client AI agents from one connected workspace.',
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
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_YnVpbGRfdGltZV9kdW1teV9jbGVya19rZXlfOTguY2xlcmsuYWNjb3VudHMuZGV2JA'}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${jakarta.variable} font-sans min-h-screen antialiased`}>
          {/* DataFast Analytics - Must be in body for Next.js Script component */}
          <Script
            defer
            data-website-id="dfid_8E14zpXFdL9r5htqEUbhI"
            data-domain="chatdock.io"
            src="https://datafa.st/js/script.js"
            strategy="afterInteractive"
          />



          {/* Organization JSON-LD */}
          <Script id="ld-organization" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ChatDock',
              url: APP_URL,
              logo: `${APP_URL}/images/logo.svg`,
            })}
          </Script>

          {/* SoftwareApplication (SaaS) JSON-LD */}
          <Script id="ld-software" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'ChatDock',
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
            <AgentProvider>
              {children}
              <Toaster />
            </AgentProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
