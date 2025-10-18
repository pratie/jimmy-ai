import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Cuprum } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/them-provider'

const cuprum = Cuprum({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '700'],
})

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://bookmylead.app').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
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
    images: [
      {
        url: `${APP_URL}/images/social_graph_img.png`,
        width: 1200,
        height: 630,
        alt: 'BookMyLead · Website AI Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookmyLead AI - AI Agent Trained on Your Company Data',
    description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep.',
    images: [`${APP_URL}/images/social_graph_img.png`],
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
        <body className={`${cuprum.className} min-h-screen`}>
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
