import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/them-provider'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
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
  openGraph: {
    title: 'BookmyLead AI - AI Agent Trained on Your Company Data',
    description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookmyLead AI - AI Agent Trained on Your Company Data',
    description: 'Deploy an AI agent trained on your company data to capture leads 24/7, answer questions instantly, and close deals while you sleep.',
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
        <body className={`${jakarta.className} landing-gradient min-h-screen`}>
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
